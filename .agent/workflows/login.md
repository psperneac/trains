---
description: How to reliably log in to the Trains application for browser automation
---

# Logging into the Trains Application

To perform browser automation or verification on this project, follow these specific steps to avoid common login quirks.

## Credentials

- **Admin Email**: `admin@example.com`
- **Password**: `password`

## Login Procedure for Agents

1. **Navigate** to `http://localhost:3000/login`.
2. **Stable IDs**: Use the following CSS selectors for reliable element selection:
   - Email Input: `#auth-email`
   - Password Input: `#auth-password`
   - Submit Button: `#auth-submit-button`
3. **Handle Autofill Quirks**:
   - Chrome's password manager may automatically fill the password field.
   - **CRITICAL**: Always clear the inputs using JavaScript before typing to avoid double-pasting or stale values.
   - Example JS for clearing:
     ```javascript
     document.querySelector('#auth-email').value = '';
     document.querySelector('#auth-email').dispatchEvent(new Event('input', { bubbles: true }));
     document.querySelector('#auth-password').value = '';
     document.querySelector('#auth-password').dispatchEvent(new Event('input', { bubbles: true }));
     ```
4. **Verification of Login State**:
   - Check for the existence of `#places-page-container` to confirm successful navigation to the main admin area.

## Common Quirks

- **Password Double-Type**: If you land on the password field and it's already filled by the browser, typing "password" without clearing will result in "passwordpassword".
- **React State**: Simply setting `.value` via JS might not trigger React state updates. Always dispatch the `input` event after setting the value manually.
