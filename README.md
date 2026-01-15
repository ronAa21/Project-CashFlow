# Threads
My first project Threads (previously project_s)

### WEEK 1 (WEEK 3 of learning HTML & CSS) - no javascript yet - June 8, 2025
- Started the development of the customer and manager homepage, side bar, navigation bar, and the body of the web.
- Started learning the flexbox, grid, position, and media query in depth.

### WEEK 2 (WEEK 4 of learning HTML & CSS) - no javascript yet - June 15, 2025
- Added the UI modal that shows the details and the status of the order.

### WEEK 3 (WEEK 5 of learning HTML & CSS) - no javascript yet - June 22, 2025
- Added the placeholder for the dynamic values on the website(i.e customers, messages, and due dates)
- Added user friendly interfaces (Addtional confirmation modal and hover effects)
- Added the Static version for the login & signup

### WEEK 4 (A month after learning JavaScript) - July 17, 2025
- Made the side bar of the customer-side dynamic (for both mobile & PC)
- Added the modal popup

### WEEK 5 (WEEK 10 - LEARNING JAVASCRIPT) - July 21, 2025
- Made the customer orders to be displayed dynamically (Retrieved through an object array)
- Added the functions for the dropdown, dynamically displaying the customers order data

### WEEK 5 (still in the same week (:) - July 25, 2025
- Added the cashflow functions(can calculate, add rows, and display the total)
- Made the customer to be displayed dynamically on the progress panel
- The due date is able to display orders that are of due (orders that are 3 days due)

### WEEK 6 (WEEK 11 - WEEK 12 - LEARNING JAVASCRIPT) - August 4, 2025
- Able to update the status for customers through the modal
- Added the progress bar below the modal (progress depends on the status)
- Added local storage for login and signup

### WEEK 7 (WEEK 13 - 14/LEARNING JAVASCRIPT) - August 18, 2025
- Updated the logic for logging in and signing-up, retrieving the email value from the local storage of the manager side's customer array.
- Fixed the issue on the modal for the mobile view of the customer side.
- Refined the customer array for both the customer/manager side to be retrieved on the local storage.

### WEEK 8 (WEEK 15 - August 25, 2025)
- Added the logic for the logout on the customer side
- Added the logic for change password on the customer side
- Added the mock messenger logic (able to send a message although just a mock) in manager and customer side

### WEEK 9 (WEEK 15 - August 30, 2025)
- Added the logic where the remarks can be saved for both customers and manager

### WEEK 10 (WEEK 29 - December 26-29, 2025)
(On a hiatus (: Studied react and backend during that time)
- Removed the logic of localStorage for signup and replaced with Auth backend
- Removed the logic of localStorage for login and replaced with Auth backend
- Removed the logic of localStorage for customer dashboard and display data through database
- Successfully connected the signup, logic, and customer dashboard
- UI overhaul for signup, logic, and customer dashboard

### WEEK 10 (WEEK 29 - December 31, 2025)
- Removed the logic of localStorage for manager dashboard and display customer data through database
- Able to add customer through manager dashboard and save through database.
- Able to update status through database
- Able to display due orders

### WEEK 11 (WEEK 30 - January 1, 2026)
- Fixed the issue where the measurement data is not displaying
- Added a feature where if the status is ready or released it will be green on the due section
- == CUSTOMER PANEL DONE == 
- Able to add cashflow data and saved to the database
- fixed the issue where when adding it resets the initial value to 0
- == CASHFLOW PANEL DONE ==

### WEEK 11 (WEEK 30 - January 2, 2026)
- Added the chat feature
- Able to chat between customers and managers
- == PROJECT_S PARTIALLY DONE ==

### WEEK 11 (WEEK 30 - January 3, 2026)
- Added a clear function on cashflow tab
- Fix the ui on manager and customer side
- Able to change pass on customer side

### WEEK 12 (WEEK 31 - 32, January 13 - 14, 2026)
-  Fixed issue on needing to refresh for the status to reflect (confirmationModal Parameter issue)
- Fixed the auth routing bug (back/forward access)
    - Security + UX issue - Fixed replace the `window.location.href` with `window.location.replace()` for signup, login, manager, and customer
- Added loading and error states
    - Added loading/error states on login/signup
    - Added on Manager (w/ fixes on the UI issue for chat tab)
    - Added on Customers
- Added a search bar for customers and add a function on the search bar for chats
    - Done for customer tab (Manager side)
    - Done for side bar (Manager side)
- Added a feature where the one with recent chats on the top of the sidebar (Manager side) refactor my sidebar and loadSideBarCustomers function.
- Fixed the side-bar issue (Manager side) where you need to refresh to be able to display the new customer
    - Fixed (Adjusted displayData function)
- Fixed chat duplication
    - fixed for both manager and customer
- Replace alerts with modals
    - replaced for both all sides
- Mobile UI fixes
    - Added on manager since customer side already has it
