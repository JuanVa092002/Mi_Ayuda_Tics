# scripts/validate_contracts_v213.ps1
$ErrorActionPreference = "Stop"

$schemaCanonicalPath = "evaluation/schemas/task-schema-v2.1.json"
$schemaBlindPath     = "evaluation/schemas/public-blind-task-schema-v2.1.json"
$groundTruthPath     = "evaluation/private/ground-truth.json"
$hiddenTasksPath     = "evaluation/private/hidden-tasks-v2.1.json"
$publicSuitePath     = "evaluation/public/task-suite.json"

[Console]::WriteLine("=== 1. PARSING JSON ARTIFACTS ===")

$rawCanonicalSchema = [System.IO.File]::ReadAllText($schemaCanonicalPath, [System.Text.Encoding]::UTF8)
$canonicalSchema    = $rawCanonicalSchema | ConvertFrom-Json
[Console]::WriteLine("Canonical Schema: PASS (Title: {0})", $canonicalSchema.title)

$rawBlindSchema     = [System.IO.File]::ReadAllText($schemaBlindPath, [System.Text.Encoding]::UTF8)
$blindSchema        = $rawBlindSchema | ConvertFrom-Json
[Console]::WriteLine("Public Blind Schema: PASS (Title: {0})", $blindSchema.title)

$rawGroundTruth     = [System.IO.File]::ReadAllText($groundTruthPath, [System.Text.Encoding]::UTF8)
$groundTruth        = $rawGroundTruth | ConvertFrom-Json
[Console]::WriteLine("Ground Truth: PASS (Rubric: {0})", $groundTruth.rubric_version)

$rawHiddenTasks     = [System.IO.File]::ReadAllText($hiddenTasksPath, [System.Text.Encoding]::UTF8)
$hiddenTasks        = $rawHiddenTasks | ConvertFrom-Json
[Console]::WriteLine("Hidden Suite: PASS (Version: {0})", $hiddenTasks.version)

# Clean public suite lines if markdown comments exist
$publicRawLines = [System.IO.File]::ReadAllLines($publicSuitePath, [System.Text.Encoding]::UTF8)
$publicCleanLines = @()
foreach ($line in $publicRawLines) {
    if (-not ($line.StartsWith("#") -or $line.StartsWith(">"))) {
        $publicCleanLines += $line
    }
}
$rawPublicJson = [string]::Join("`n", $publicCleanLines).Trim()
$publicTasks = $rawPublicJson | ConvertFrom-Json
[Console]::WriteLine("Public Suite: PASS (Count: {0})", $publicTasks.Count)

[Console]::WriteLine("`n=== 2. AUDITING BLIND SEPARATION ===")
$allowedBlindFields = @("task_id", "surface", "user_intent")
$unexpectedPublicFields = 0
$leakedPrivateFields = 0
$publicAllowedSurfaces = @("client", "server", "mobile", "packages", "cross")

foreach ($t in $publicTasks) {
    $props = $t.PSObject.Properties | ForEach-Object { $_.Name }
    foreach ($p in $props) {
        if ($allowedBlindFields -notcontains $p) {
            [Console]::WriteLine("ERROR: Public task {0} has unexpected field: {1}", $t.task_id, $p)
            $unexpectedPublicFields++
        }
        if (@("risk_envelope", "risk_model", "routing", "hard_constraints", "soft_preferences", "verification_contract", "verification", "target_path") -contains $p) {
            $leakedPrivateFields++
        }
    }
    if ($publicAllowedSurfaces -notcontains $t.surface) {
        [Console]::WriteLine("ERROR: Invalid surface in public task {0}: {1}", $t.task_id, $t.surface)
    }
}
[Console]::WriteLine("Unexpected public fields: {0}", $unexpectedPublicFields)
[Console]::WriteLine("Ground-truth / private fields leaked: {0}", $leakedPrivateFields)

[Console]::WriteLine("`n=== 3. AUDITING CANONICAL SCHEMA HARDENING ===")
[Console]::WriteLine("Root additionalProperties: {0}", $canonicalSchema.additionalProperties)
[Console]::WriteLine("risk_envelope additionalProperties: {0}", $canonicalSchema.properties.risk_envelope.additionalProperties)
[Console]::WriteLine("routing additionalProperties: {0}", $canonicalSchema.properties.routing.additionalProperties)
[Console]::WriteLine("soft_preferences additionalProperties: {0}", $canonicalSchema.properties.soft_preferences.additionalProperties)
[Console]::WriteLine("verification_contract additionalProperties: {0}", $canonicalSchema.properties.verification_contract.additionalProperties)

[Console]::WriteLine("`n=== 4. AUDITING LEGACY STRINGS IN PRIVATE DATASETS ===")
$filesToCheck = @($schemaCanonicalPath, $groundTruthPath, $hiddenTasksPath)
$riskModelOccurrences = 0
$legacyVerifOccurrences = 0
foreach ($fc in $filesToCheck) {
    $raw = [System.IO.File]::ReadAllText($fc, [System.Text.Encoding]::UTF8)
    if ($raw.Contains('"risk_model"')) { $riskModelOccurrences++ }
    if ($raw.Contains('"expected_outcomes"') -or $raw.Contains('"negative_tests"')) { $legacyVerifOccurrences++ }
}
[Console]::WriteLine("Occurrences of risk_model: {0}", $riskModelOccurrences)
[Console]::WriteLine("Occurrences of legacy verification: {0}", $legacyVerifOccurrences)

[Console]::WriteLine("`n=== 5. VALIDATING HIDDEN SUITE CANONICAL CONFORMANCE ===")
$validSurfaces = @("client", "server", "mobile", "packages", "cross")
$validBlastRadius = @("local", "component", "module", "multi_surface", "global")
$hiddenFamilies = @{}
$invalidBlastRadiusCount = 0
$invalidSurfaceCount = 0
$missingRequiredCount = 0

foreach ($ht in $hiddenTasks.tasks) {
    $fam = $ht.family
    if (-not $hiddenFamilies.ContainsKey($fam)) { $hiddenFamilies[$fam] = 0 }
    $hiddenFamilies[$fam]++

    if ($validSurfaces -notcontains $ht.surface) {
        $invalidSurfaceCount++
    }
    if ($validBlastRadius -notcontains $ht.risk_envelope.blast_radius) {
        [Console]::WriteLine("ERROR: Invalid blast_radius in {0}: {1}", $ht.task_id, $ht.risk_envelope.blast_radius)
        $invalidBlastRadiusCount++
    }
    if (-not $ht.task_id -or -not $ht.surface -or -not $ht.user_intent -or -not $ht.risk_envelope -or -not $ht.routing -or -not $ht.hard_constraints -or -not $ht.verification_contract) {
        $missingRequiredCount++
    }
}
[Console]::WriteLine("Hidden Families distribution:")
foreach ($k in $hiddenFamilies.Keys) {
    [Console]::WriteLine("  {0}: {1}", $k, $hiddenFamilies[$k])
}
[Console]::WriteLine("Invalid blast_radius: {0}", $invalidBlastRadiusCount)
[Console]::WriteLine("Invalid surface: {0}", $invalidSurfaceCount)
[Console]::WriteLine("Missing required canonical fields: {0}", $missingRequiredCount)

[Console]::WriteLine("`n=== 6. VALIDATING GROUND TRUTH CONFORMANCE ===")
$gtTasks = $groundTruth.tasks
$gtProps = $gtTasks.PSObject.Properties | ForEach-Object { $_.Name }
[Console]::WriteLine("Ground Truth Tasks Count: {0}", $gtProps.Count)
$gtInvalidBlast = 0
foreach ($tid in $gtProps) {
    $item = $gtTasks.$tid
    if ($validBlastRadius -notcontains $item.risk_envelope.blast_radius) {
        $gtInvalidBlast++
    }
}
[Console]::WriteLine("Ground Truth Invalid blast_radius: {0}", $gtInvalidBlast)

[Console]::WriteLine("`n=== 7. CRYPTOGRAPHIC DIGESTS (SHA-256) ===")
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$targetFiles = @(
    $schemaCanonicalPath,
    $schemaBlindPath,
    $publicSuitePath,
    $groundTruthPath,
    $hiddenTasksPath
)
foreach ($tf in $targetFiles) {
    $bytes = [System.IO.File]::ReadAllBytes($tf)
    $hashBytes = $sha256.ComputeHash($bytes)
    $hex = -join ($hashBytes | ForEach-Object { $_.ToString("x2") })
    [Console]::WriteLine("{0}:`n  SHA256: {1}", $tf, $hex)
}
