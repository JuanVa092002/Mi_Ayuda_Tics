# Delta for mobile-funcionario-ux

## ADDED Requirements

### Requirement: Bottom Tab Navigation — Funcionario Role

The system SHALL implement bottom tab navigation for the Funcionario role with three primary tabs: Home, Nueva Solicitud, and Historial. The tab bar MUST remain visible on all main screens.

The system MUST highlight the active tab using the brand green color (`#22C55E`). The system SHOULD apply a bold or filled icon style to the active tab to indicate selection.

The system SHALL display a badge or indicator on the Historial tab when the unread solicitud count is greater than zero.

#### Scenario: User views active tab highlighting

- GIVEN the Funcionario is authenticated and on the Home screen
- WHEN the tab bar renders
- THEN the Home tab is visually marked as active with brand green highlight
- AND the Historial tab displays a badge count if unread solicitudes exist

#### Scenario: User switches tabs with unread count

- GIVEN the Funcionario has 3 unread solicitudes
- WHEN the user taps the Historial tab
- THEN the badge clears (unread count resets to 0)
- AND the Historial tab becomes the active tab

---

### Requirement: Native Stack Navigation — Detail Screens

The system SHALL use native stack navigation for detail screens (e.g., Solicitud Detail). The system MUST render a native back button (chevron icon) in the header; text labels such as "← Volver" are prohibited.

The header SHALL display only the current screen title and MUST NOT mix navigation controls with content.

#### Scenario: User navigates to Solicitud detail from list

- GIVEN the Funcionario taps a SolicitudListItem on Home or Historial
- WHEN the detail screen renders
- THEN a native chevron back button appears in the header
- AND no "← Volver" text button is displayed

---

### Requirement: Header — Profile and Session Controls

The system SHALL display the authenticated user's profile photo and first name in the header right slot. The system MUST provide logout functionality via a header overflow menu (three-dot icon) accessible from any Funcionario screen.

The logout action MUST NOT be buried within individual screen content.

#### Scenario: User accesses profile and logout

- GIVEN the Funcionario is on any Funcionario screen
- WHEN the user taps the header overflow menu (three dots)
- THEN a menu appears with "Mi Perfil" and "Cerrar Sesión" options
- AND tapping "Cerrar Sesión" navigates to the login screen

---

### Requirement: Home Screen — Time-Based Greeting

The system SHALL display a time-based greeting on the Home screen using the format "Buenos días/tardes/noches, {nombre}" where the time period is determined by the device clock (morning: 05:00–11:59, afternoon: 12:00–18:59, evening: 19:00–04:59).

The system MUST persist the authenticated session across app restarts using secure storage.

#### Scenario: User opens app in the morning

- GIVEN the Funcionario opens the app at 09:30 local time
- WHEN the Home screen renders
- THEN the greeting displays "Buenos días, {firstName}"

#### Scenario: Session persists across restart

- GIVEN the Funcionario has a valid session token
- WHEN the app is killed and relaunched
- THEN the user lands directly on the Home screen without re-authenticating

---

### Requirement: Home Screen — Stats Row

The system SHALL display three stat cards on the Home screen: Pendientes (pending count), En Proceso (in-process count), and Resueltas (resolved count). Each card MUST be tappable to filter the Historial view by that status.

#### Scenario: User taps Pendientes stat card

- GIVEN the Funcionario is on the Home screen
- WHEN the user taps the Pendientes card
- THEN the app navigates to the Historial tab with the "Pendiente" filter pre-applied

---

### Requirement: Home Screen — Quick Action and Recent Section

The system SHALL render a prominent "Nueva Solicitud" button as the primary CTA on the Home screen. The system MUST display a "Solicitudes recientes" section showing the last 3 solicitudes with a "Ver historial" link.

Each recent SolicitudListItem MUST be tappable to navigate to its detail screen. The Home screen MUST support pull-to-refresh to reload all data.

#### Scenario: User creates new solicitud from quick action

- GIVEN the Funcionario is on the Home screen
- WHEN the user taps the "Nueva Solicitud" button
- THEN the app navigates to the Nueva Solicitud tab

#### Scenario: Pull-to-refresh updates content

- GIVEN the Funcionario is on the Home screen
- WHEN the user pulls down to refresh
- THEN skeleton loaders display while data fetches
- AND new greeting, stats, and recent list render on completion

#### Scenario: Empty state with no solicitudes

- GIVEN the Funcionario has zero solicitudes
- WHEN the Home screen renders
- THEN an encouraging empty state message displays
- AND the "Nueva Solicitud" button remains prominently visible

---

### Requirement: Nueva Solicitud Screen — Form Fields and Validation

The system SHALL render a form with the following fields: Equipo/Línea (picker, required), Tipo de Caso (picker, required), Descripción (textarea, required), Teléfono (optional), and Evidencia (photo attachment).

Required fields MUST be marked with an asterisk. The system MUST perform inline validation on blur and display error messages in red below the offending field; the field border MUST also turn red.

#### Scenario: User submits with empty required field

- GIVEN the Funcionario leaves Equipo/Línea empty and blurs the field
- WHEN the user attempts to submit
- THEN the field border turns red
- AND the message "Este campo es requerido" appears below it

#### Scenario: Photo evidence selection

- GIVEN the Funcionario taps the Evidencia field
- WHEN the picker renders
- THEN a bottom sheet offers "Tomar foto" (camera) and "Elegir de galería" (gallery) options
- AND selecting either option attaches the image to the form

---

### Requirement: Nueva Solicitud Screen — Submission and Success State

The system MUST disable the submit button while a submission is in progress and display an inline spinner within the button. The system SHALL NOT use Alert.alert for success feedback.

Upon successful submission, the system MUST display an inline success card with two actions: "Ir a ver detalle" (navigates to the new Solicitud detail) and "Hacer otra" (resets the form for another submission).

If the user navigates away from the form and returns, the system SHOULD preserve any entered form data.

#### Scenario: Successful submission

- GIVEN the Funcionario fills all required fields correctly and taps submit
- WHEN the submission is processing
- THEN the submit button is disabled with an inline spinner
- AND upon success, an inline success card appears
- AND "Ir a ver detalle" navigates to the new Solicitud detail screen

#### Scenario: User returns after partial entry

- GIVEN the Funcionario partially fills the form and navigates away
- WHEN the user returns to the Nueva Solicitud screen
- THEN all previously entered data is preserved

---

### Requirement: Historial Screen — Search and Filter

The system SHALL implement debounced search (300ms) across equipo/línea/descripción fields. The system MUST provide horizontal-scrollable filter chips: All, Pendiente, En Proceso, Resuelta. The active filter chip MUST be highlighted with brand green.

The results MUST render in a FlatList using SolicitudListItem components. The system SHALL display an empty state message "No se encontraron solicitudes para '{query}'" when search yields no results. Pull-to-refresh MUST be supported.

#### Scenario: User searches with active filter

- GIVEN the Funcionario has applied the "Pendiente" filter
- WHEN the user types a search query
- THEN only Pendiente solicitudes matching the query display
- AND the "Pendiente" chip remains highlighted

---

### Requirement: Solicitud Detail Screen — Layout and Actions

The system SHALL render the StatusBadge prominently at the top of the Solicitud Detail screen. The system MUST display card sections for: Description, Equipment/Line, Case Type, Phone, Photo Evidence, and Timeline.

If the Solicitud status is Pendiente, the system MUST include a "Cancelar" option in the header overflow menu.

The Timeline component MUST render completed steps in green, the current step in brand blue, and upcoming steps in gray.

Resolved cases MUST display the solution description and resolution photo if available.

#### Scenario: User cancels pending solicitud

- GIVEN the Funcionario is viewing a Pendiente solicitud detail
- WHEN the user taps the header overflow menu and selects "Cancelar"
- THEN a confirmation prompt appears
- AND on confirm, the solicitud status updates to Cancelada
- AND the user is navigated back to the previous screen

---

### Requirement: Loading States

The system SHALL use skeleton screens for initial Home screen load (3-4 skeleton cards). The Historial screen MUST display skeleton list items during loading. Form submissions MUST show an inline spinner within the submit button (not a full-screen overlay). Pull-to-refresh MUST display a spinner at the top of the content area.

#### Scenario: Initial home load

- GIVEN the Funcionario opens the app to the Home screen
- WHEN data is being fetched
- THEN 3-4 skeleton cards render in place of content
- AND the greeting, stats, and recent list render when data arrives

---

### Requirement: Error States

Network errors MUST display a friendly error message with a retry button. Authentication errors (401/403) MUST redirect the user to the login screen. Form validation errors MUST display inline red text below the field with a red border.

#### Scenario: Network error on home load

- GIVEN the Funcionario is on the Home screen and network connectivity is lost
- WHEN the data fetch fails
- THEN a friendly error message displays: "No se pudo cargar la información. Revisa tu conexión."
- AND a "Reintentar" button is visible

---

### Requirement: Accessibility

All interactive elements MUST have an accessibilityLabel. StatusBadge MUST use accessibilityRole="text" with a descriptive state label (e.g., "Estado: Pendiente"). Minimum touch target size is 44x44pt. Color contrast MUST meet WCAG 4.5:1 for text and 3:1 for UI components.

#### Scenario: VoiceOver/TalkBack announces status

- GIVEN the Funcionario is viewing a solicitud with status "En Proceso"
- WHEN VoiceOver/TalkBack focuses on the StatusBadge
- THEN it announces "Estado: En Proceso"

---

### Requirement: Haptic Feedback

The system SHOULD trigger haptic feedback using light impact on button press and tab switch, selection changed on list item tap, and success notification on successful form submission.

#### Scenario: Tab switch provides haptic

- GIVEN the Funcionario taps the Historial tab
- WHEN the tab switch occurs
- THEN a light haptic impact fires

---

## MODIFIED Requirements

None — this is a new domain specification.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
