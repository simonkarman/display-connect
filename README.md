# Display Connect
Enabling users to connect mobile devices as a controller to a larger display via QR code scanning.

Live demo: [Display Connect](https://display-connect.vercel.app)

## About
Display Connect is a demo application that enables users to connect mobile devices as a controller to a larger display via QR code scanning. The idea came after playing the [Sunderfold game](https://www.dreamhaven.com/games/sunderfolk) last weekend. Sunderfolk is a shared turn-based tactical RPG adventure where your phone becomes the controller. Inspired by gathering around a table with friends.

I thought: "Why not make something similar that anyone can use for their own projects?". It is the perfect project for [Krmx](https://simonkarman.github.io/krmx). Krmx is a network protocol for realtime multi-user interactions that I designed. It allows multiple devices to communicate with each other in real-time, making it ideal for applications this use case. It is the perfect solution for creating multiplayer games, collaborative applications, and interactive experiences.

So I created Display Connect - a simple demo to showcase how Krmx can be used to turn phones into controllers for a bigger screen. No need to download any apps, just scan a QR code and you're ready to use if from your web browser.

This demo showcases a very simple scenario, but you can use this to created applications for shared whiteboard sessions, board games, collaborative team exercises, or whatever you can think of.

You can find the live demo here: [Display Connect](https://display-connect.vercel.app). Reminder: Open this link on a large screen, and then scan the QR code with your phone to connect as a controller.

## Terminology
**Display** -- The main display (typically a large screen or monitor) that shows the primary content and shows a QR code to allow mobile devices to connect.

**Controller** -- Mobile devices (phones, tablets) that scan the QR code to connect and interact with the display.

**Krmx** -- Display Connect is build with [Krmx](https://simonkarman.github.io/krmx). Krmx is a network protocol for realtime multi-user interactions. A Krmx Server handles all websocket connections that the UI of both the display and the controllers to. Both UIs use the Krmx Client for React to connect to the server and send/receive messages.

## Getting Started
To get started with local development on Display Connect, follow these steps:

1. Clone this repository.

2. Start the Krmx server:
    ```bash
    cd server/
    npm install
    npm run dev
    ```

3. Then, start the client (in a separate terminal):
    ```bash
    cd client/
    npm install
    npm run dev
    ```

4. Now the server and client are running on your local machine. You can access the client at `http://localhost:3000` and the Krmx server at `http://localhost:8082`.

5. Both are set up with hot reloading, so you can make changes to the code and see them reflected in the browser immediately.
