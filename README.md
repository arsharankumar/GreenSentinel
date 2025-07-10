# GreenSentinel

## Purpose
A significant barrier to reporting illegal activities, including those affecting our precious forests, is the fear of identity disclosure. This reluctance allows critical issues like forest degradation to persist unchecked. But we cannot afford to lose our forests. Recognizing the urgent need for action, GreenSentinel is built to empower individuals to contribute to conservation without compromising their safety.

## Functionality and Features
GreenSentinel provides a secure platform for individuals to anonymously report illegal activities occurring within forest ecosystems. This anonymity encourages broader witness participation, which is vital for effectively reducing threats to our forests.

Upon receiving a complaint, regional forest authorities can access detailed reports, take necessary actions, and update the complaint status to "In Progress" or "Resolved," keeping the anonymous witness informed of the progress. To maintain the integrity of the system and prevent misuse of anonymity, a robust spam detection mechanism is in place:

  - Authorities can mark complaints as "Spam."

  - If a user's complaints are marked as "Spam" three or more times, their anonymity will be revoked, and their identity revealed to authorities.

  - Furthermore, all their previous and future complaints will carry a prominent warning indicating their history of spam reporting.

## Getting Started
### Quick Start

<details>
  
The web app is already deployed. Just click the link below to visit:
```  
https://greensentinel-70472.web.app/
```
  
</details>

### Running Locally

<details>

To run the web app on your local computer, clone the Repository to your local machine:
```
https://github.com/arsharankumar/GreenSentinel.git

```
Navigate to greensentinel directory:
```
cd greensentinel
```
Install Dependencies:
```
npm install
```
Start the server on your computer:
```
npm run dev
```

</details>

## Tech Stack

-   **Frontend:** React <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png" alt="React Logo" width="25" height="25">
-   **Styling:** Tailwind CSS <img src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.d52e9897.svg" alt="Tailwind CSS Logo" width="25" height="25">
-   **Backend/Database:** Firebase <img src="https://www.gstatic.com/devrel-devsite/prod/vc3d1f04cf8a7ff2a3cf2d02c46274b77f88421bb461e7041a12d1b54a20b7548/firebase/images/touchicon-180.png" alt="Firebase Logo" width="25" height="25">
-   **Build Tool:** Vite <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Vitejs-logo.svg/512px-Vitejs-logo.svg.png" alt="Vite Logo" width="25" height="25">
