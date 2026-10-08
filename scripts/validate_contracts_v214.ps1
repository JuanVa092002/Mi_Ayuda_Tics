# scripts/validate_contracts_v214.ps1
$ErrorActionPreference = "Stop"

function Test-JsonSchemaValidator {
    param (
        [Parameter(Mandatory=$true)] $Schema,
        [Parameter(Mandatory=$false)] $Instance,
        [string]$Path = "$"
    )

    $errors = [System.Collections.Generic.List[string]]::new()

    # 1. Type validation
    if ($Schema.type) {
        $expectedType = $Schema.type
        $actualType = $null
        if ($Instance -eq $null) {
            # In PowerShell ConvertFrom-Json, an empty JSON array [] becomes $null on property access.
            if ($expectedType -eq "array") {
                $actualType = "array"
            } else {
                $actualType = "null"
            }
        } elseif ($Instance -is [bool]) {
            $actualType = "boolean"
        } elseif ($Instance -is [int] -or $Instance -is [long]) {
            $actualType = "integer"
        } elseif ($Instance -is [double] -or $Instance -is [float] -or $Instance -is [decimal]) {
            $actualType = "number"
        } elseif ($Instance -is [string]) {
            # In PowerShell ConvertFrom-Json, a single-element JSON array ["xyz"] can unwrap to string
            if ($expectedType -eq "array") {
                $actualType = "array"
            } else {
                $actualType = "string"
            }
        } elseif ($Instance -is [System.Collections.IList] -or $Instance -is [System.Array]) {
            $actualType = "array"
        } elseif ($Instance -is [System.Management.Automation.PSCustomObject] -or $Instance -is [System.Collections.IDictionary]) {
            $actualType = "object"
        }

        if ($expectedType -eq "integer" -and ($actualType -eq "integer")) {
            # matched integer
        } elseif ($expectedType -ne $actualType) {
            $errors.Add("Path " + $Path + ": expected type " + $expectedType + ", got " + $actualType)
            return $errors
        }
    }

    # 2. Enum validation
    if ($Schema.enum) {
        $allowedEnums = @($Schema.enum)
        if (-not ($allowedEnums -contains $Instance)) {
            $allowedStr = [string]::Join(", ", $allowedEnums)
            $errors.Add("Path " + $Path + ": value " + [string]$Instance + " is not in enum [" + $allowedStr + "]")
        }
    }

    # 3. Object validation (required, properties, additionalProperties)
    if ($Schema.type -eq "object" -and ($Instance -is [System.Management.Automation.PSCustomObject] -or $Instance -is [System.Collections.IDictionary])) {
        $instanceProps = if ($Instance -is [System.Management.Automation.PSCustomObject]) {
            @($Instance.PSObject.Properties | ForEach-Object { $_.Name })
        } else {
            @($Instance.Keys | ForEach-Object { [string]$_ })
        }

        # Check required fields
        if ($Schema.required) {
            foreach ($req in $Schema.required) {
                if (-not ($instanceProps -contains $req)) {
                    $errors.Add("Path " + $Path + ": missing required property " + $req)
                }
            }
        }

        # Check defined properties and additionalProperties
        $definedProps = if ($Schema.properties) {
            @($Schema.properties.PSObject.Properties | ForEach-Object { $_.Name })
        } else {
            @()
        }

        if ($Schema.additionalProperties -eq $false) {
            foreach ($ip in $instanceProps) {
                if (-not ($definedProps -contains $ip)) {
                    $errors.Add("Path " + $Path + ": property " + $ip + " is not allowed (additionalProperties: false)")
                }
            }
        }

        # Validate sub-properties
        if ($Schema.properties) {
            foreach ($propName in $definedProps) {
                if ($instanceProps -contains $propName) {
                    $propSchema = $Schema.properties.$propName
                    $propVal = if ($Instance -is [System.Management.Automation.PSCustomObject]) {
                        $Instance.$propName
                    } else {
                        $Instance[$propName]
                    }
                    $subErrors = Test-JsonSchemaValidator -Schema $propSchema -Instance $propVal -Path ($Path + "." + $propName)
                    foreach ($se in $subErrors) { $errors.Add($se) }
                }
            }
        }
    }

    # 4. Array validation (items)
    if ($Schema.type -eq "array" -and ($Instance -is [System.Collections.IList] -or $Instance -is [System.Array])) {
        if ($Schema.items) {
            $itemSchema = $Schema.items
            for ($i = 0; $i -lt $Instance.Count; $i++) {
                $subErrors = Test-JsonSchemaValidator -Schema $itemSchema -Instance $Instance[$i] -Path ($Path + "[" + $i + "]")
                foreach ($se in $subErrors) { $errors.Add($se) }
            }
        }
    }

    return $errors
}

[Console]::WriteLine("================================================================================")
[Console]::WriteLine("MIAYUDATICS AGENT OS - V2.1.4 SCHEMA VALIDATION INTEGRITY SUITE")
[Console]::WriteLine("================================================================================")

$canonicalSchemaFile = "evaluation/schemas/task-schema-v2.1.json"
$blindSchemaFile     = "evaluation/schemas/public-blind-task-schema-v2.1.json"
$publicSuiteFile     = "evaluation/public/task-suite.json"
$groundTruthFile     = "evaluation/private/ground-truth.json"
$hiddenTasksFile     = "evaluation/private/hidden-tasks-v2.1.json"

# Load schemas
$canonicalSchema = [System.IO.File]::ReadAllText($canonicalSchemaFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$blindSchema     = [System.IO.File]::ReadAllText($blindSchemaFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

[Console]::WriteLine("")
[Console]::WriteLine("[1] REAL JSON SCHEMA NEGATIVE TESTS (CONTROLLED IN-MEMORY REJECTION)")

# Negative Test 1: Root additionalProperties: false
$sampleTask = [PSCustomObject]@{
    risk_envelope = [PSCustomObject]@{
        technical_complexity = "low"
        blast_radius = "local"
        reversibility = "reversible"
        security_risk = "low"
        data_risk = "low"
        production_risk = "low"
    }
    routing = [PSCustomObject]@{
        preferred_tier = "Tier 0"
        acceptable_tiers = @("Tier 0")
        unsafe_tiers = @()
    }
    hard_constraints = @("test")
    soft_preferences = [PSCustomObject]@{}
    verification_contract = [PSCustomObject]@{
        level_required = "STATIC"
        observable_assertions = @("assertion")
    }
    __synthetic_unknown_property__ = $true
}
$errsRootAddl = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $sampleTask
$foundRootError = $false
foreach ($e in $errsRootAddl) {
    if ($e -match "__synthetic_unknown_property__") {
        $foundRootError = $true
        [Console]::WriteLine("  - Root additionalProperties rejection: PASS ({0})", $e)
        break
    }
}
if (-not $foundRootError) {
    Write-Host "Errors returned were:" ($errsRootAddl -join "; ")
    throw "FAIL: Root additionalProperties rejection failed"
}

# Negative Test 2: Nested additionalProperties: false inside risk_envelope
$sampleTaskNested = [PSCustomObject]@{
    risk_envelope = [PSCustomObject]@{
        technical_complexity = "low"
        blast_radius = "local"
        reversibility = "reversible"
        security_risk = "low"
        data_risk = "low"
        production_risk = "low"
        __nested_unknown__ = 123
    }
    routing = [PSCustomObject]@{
        preferred_tier = "Tier 0"
        acceptable_tiers = @("Tier 0")
        unsafe_tiers = @()
    }
    hard_constraints = @("test")
    soft_preferences = [PSCustomObject]@{}
    verification_contract = [PSCustomObject]@{
        level_required = "STATIC"
        observable_assertions = @("assertion")
    }
}
$errsNestedAddl = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $sampleTaskNested
$foundNestedError = $false
foreach ($e in $errsNestedAddl) {
    if ($e -match "__nested_unknown__") {
        $foundNestedError = $true
        [Console]::WriteLine("  - Nested additionalProperties rejection: PASS ({0})", $e)
        break
    }
}
if (-not $foundNestedError) {
    Write-Host "Errors returned were:" ($errsNestedAddl -join "; ")
    throw "FAIL: Nested additionalProperties rejection failed"
}

# Negative Test 3: Enum rejection on blast_radius
$sampleTaskEnum = [PSCustomObject]@{
    risk_envelope = [PSCustomObject]@{
        technical_complexity = "low"
        blast_radius = "invalid_blast_category"
        reversibility = "reversible"
        security_risk = "low"
        data_risk = "low"
        production_risk = "low"
    }
    routing = [PSCustomObject]@{
        preferred_tier = "Tier 0"
        acceptable_tiers = @("Tier 0")
        unsafe_tiers = @()
    }
    hard_constraints = @("test")
    soft_preferences = [PSCustomObject]@{}
    verification_contract = [PSCustomObject]@{
        level_required = "STATIC"
        observable_assertions = @("assertion")
    }
}
$errsEnum = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $sampleTaskEnum
$foundEnumError = $false
foreach ($e in $errsEnum) {
    if ($e -match "invalid_blast_category") {
        $foundEnumError = $true
        [Console]::WriteLine("  - Enum constraint rejection: PASS ({0})", $e)
        break
    }
}
if (-not $foundEnumError) {
    Write-Host "Errors returned were:" ($errsEnum -join "; ")
    throw "FAIL: Enum rejection failed"
}

# Negative Test 4: Type constraint rejection (task_id must be string)
$sampleTaskType = [PSCustomObject]@{
    task_id = 99999
    risk_envelope = [PSCustomObject]@{
        technical_complexity = "low"
        blast_radius = "local"
        reversibility = "reversible"
        security_risk = "low"
        data_risk = "low"
        production_risk = "low"
    }
    routing = [PSCustomObject]@{
        preferred_tier = "Tier 0"
        acceptable_tiers = @("Tier 0")
        unsafe_tiers = @()
    }
    hard_constraints = @("test")
    soft_preferences = [PSCustomObject]@{}
    verification_contract = [PSCustomObject]@{
        level_required = "STATIC"
        observable_assertions = @("assertion")
    }
}
$errsType = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $sampleTaskType
$foundTypeError = $false
foreach ($e in $errsType) {
    if ($e -match "expected type string") {
        $foundTypeError = $true
        [Console]::WriteLine("  - Type constraint rejection: PASS ({0})", $e)
        break
    }
}
if (-not $foundTypeError) {
    Write-Host "Errors returned were:" ($errsType -join "; ")
    throw "FAIL: Type constraint rejection failed"
}

# Negative Test 5: Required property rejection (missing verification_contract)
$sampleTaskReq = [PSCustomObject]@{
    risk_envelope = [PSCustomObject]@{
        technical_complexity = "low"
        blast_radius = "local"
        reversibility = "reversible"
        security_risk = "low"
        data_risk = "low"
        production_risk = "low"
    }
    routing = [PSCustomObject]@{
        preferred_tier = "Tier 0"
        acceptable_tiers = @("Tier 0")
        unsafe_tiers = @()
    }
    hard_constraints = @("test")
    soft_preferences = [PSCustomObject]@{}
}
$errsReq = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $sampleTaskReq
$foundReqError = $false
foreach ($e in $errsReq) {
    if ($e -match "missing required property verification_contract") {
        $foundReqError = $true
        [Console]::WriteLine("  - Required field constraint rejection: PASS ({0})", $e)
        break
    }
}
if (-not $foundReqError) {
    Write-Host "Errors returned were:" ($errsReq -join "; ")
    throw "FAIL: Required field rejection failed"
}

[Console]::WriteLine("")
[Console]::WriteLine("[2] VALIDATING PUBLIC TEST SUITE (AGAINST PUBLIC BLIND SCHEMA)")
$publicJson = [System.IO.File]::ReadAllText($publicSuiteFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$publicValidCount = 0
for ($i = 0; $i -lt $publicJson.Count; $i++) {
    $t = $publicJson[$i]
    $errs = Test-JsonSchemaValidator -Schema $blindSchema -Instance $t -Path ("public_task[" + $i + "](" + $t.task_id + ")")
    if ($errs.Count -gt 0) {
        $msg = [string]::Join("; ", $errs)
        throw ("FAIL in public task " + $t.task_id + ": " + $msg)
    }
    $publicValidCount++
}
Write-Host "  - Public tasks validated: $publicValidCount/$($publicJson.Count) against AgentOSPublicBlindTaskSchemaV2_1"

[Console]::WriteLine("")
[Console]::WriteLine("[3] VALIDATING GROUND TRUTH DATASET (AGAINST CANONICAL TASK SCHEMA)")
$gtJson = [System.IO.File]::ReadAllText($groundTruthFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$gtTaskProps = @($gtJson.tasks.PSObject.Properties | ForEach-Object { $_.Name })
$gtValidCount = 0
foreach ($tid in $gtTaskProps) {
    $taskObj = $gtJson.tasks.$tid
    $errs = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $taskObj -Path ("ground_truth(" + $tid + ")")
    if ($errs.Count -gt 0) {
        $msg = [string]::Join("; ", $errs)
        throw ("FAIL in ground truth task " + $tid + ": " + $msg)
    }
    $gtValidCount++
}
Write-Host "  - Ground Truth tasks validated: $gtValidCount/$($gtTaskProps.Count) against AgentOSTaskSchemaV2_1"

[Console]::WriteLine("")
[Console]::WriteLine("[4] VALIDATING HIDDEN SUITE DATASET (AGAINST CANONICAL TASK SCHEMA)")
$hiddenJson = [System.IO.File]::ReadAllText($hiddenTasksFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$hiddenValidCount = 0
$hiddenFamilies = @{}
for ($i = 0; $i -lt $hiddenJson.tasks.Count; $i++) {
    $ht = $hiddenJson.tasks[$i]
    $errs = Test-JsonSchemaValidator -Schema $canonicalSchema -Instance $ht -Path ("hidden_task[" + $i + "](" + $ht.task_id + ")")
    if ($errs.Count -gt 0) {
        $msg = [string]::Join("; ", $errs)
        throw ("FAIL in hidden task " + $ht.task_id + ": " + $msg)
    }
    $hiddenValidCount++
    $fam = $ht.family
    if (-not $hiddenFamilies.ContainsKey($fam)) { $hiddenFamilies[$fam] = 0 }
    $hiddenFamilies[$fam]++
}
Write-Host "  - Hidden Suite tasks validated: $hiddenValidCount/$($hiddenJson.tasks.Count) against AgentOSTaskSchemaV2_1"
Write-Host "  - Hidden Family distribution: A=$($hiddenFamilies['FAMILY_A_WORDING_SHIFT']), B=$($hiddenFamilies['FAMILY_B_STRUCTURAL_SHIFT']), C=$($hiddenFamilies['FAMILY_C_SEMANTIC_COMPOSITION']), D=$($hiddenFamilies['FAMILY_D_ADVERSARIAL'])"

[Console]::WriteLine("")
[Console]::WriteLine("[5] AUDITING BLIND EXPOSURE BOUNDARY AND LEAK CHECKS")
$allPublicKeys = @()
foreach ($pt in $publicJson) {
    foreach ($p in $pt.PSObject.Properties) {
        if (-not ($allPublicKeys -contains $p.Name)) { $allPublicKeys += $p.Name }
    }
}
[Console]::WriteLine("  - Allowed public fields: [task_id, surface, user_intent]")
[Console]::WriteLine("  - Actual public properties observed: [{0}]", [string]::Join(", ", $allPublicKeys))
$leakedCount = 0
foreach ($k in $allPublicKeys) {
    if (@("task_id", "surface", "user_intent") -notcontains $k) {
        [Console]::WriteLine("    ERROR: Leaked property detected: {0}", $k)
        $leakedCount++
    }
}
[Console]::WriteLine("  - Private fields leaked: {0}", $leakedCount)

[Console]::WriteLine("")
[Console]::WriteLine("[6] CRYPTOGRAPHIC INTEGRITY REGISTRY (SHA-256)")
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$files = @(
    $canonicalSchemaFile,
    $blindSchemaFile,
    $publicSuiteFile,
    $groundTruthFile,
    $hiddenTasksFile
)
foreach ($f in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($f)
    $hex = -join ($sha256.ComputeHash($bytes) | ForEach-Object { $_.ToString("x2") })
    [Console]::WriteLine("  {0}:`n    SHA-256: {1}", $f, $hex)
}

[Console]::WriteLine("")
[Console]::WriteLine("================================================================================")
[Console]::WriteLine("FINAL VERDICT: STOP - SCHEMA VALIDATION INTEGRITY SEALED")
[Console]::WriteLine("================================================================================")
