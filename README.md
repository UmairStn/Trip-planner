# 🌍 Trip Planner (AI-Powered)

**Trip Planner** is an intelligent web application that generates personalized travel itineraries using advanced AI. By leveraging **OpenAI's GPT-4o / Google Gemini** models, it solves the "analysis paralysis" travelers face when planning trips, providing detailed day-by-day plans, hidden gems, and local recommendations in seconds.

---

## 🤔 Problem Space

### Problems to Solve

Travel planning is often overwhelming. Travelers spend hours researching destinations, comparing notes, and struggling to organize activities into a cohesive schedule. Generic travel sites provide lists but lack the personalization of a real travel agent. The challenge is to create a seamless, fast, and personalized planning experience.

### 👉 Problem: The "Planning Fatigue" & Information Overload

**Problem Statement:**
Generating personalized travel recommendations manually is slow and prone to bias. Users are bombarded with too much information, leading to decision fatigue. They want a unique experience but get stuck validating hundreds of options.

**Current Solution:**
Trip Planner uses **Generative AI** to act as an instant, expert travel agent. It analyzes user preferences (budget, interests, duration) and constructs a conflict-free, logically sequenced itinerary. We use prompt engineering to enforce structured JSON outputs from the LLM, ensuring the data is instantly usable by our frontend.

**Why solve this?**

- **Efficiency:** Reduces planning time from days to seconds.
- **Personalization:** Tailors the trip to specific interests (e.g., "History", "Food", "Adventure") rather than generic "Top 10" lists.
- **Discovery:** Uncovers "Hidden Gems" that standard aggregators miss.

---

## 🎯 Goals

### Project Goal

Build a robust, user-friendly web application using the **MERN Stack (MongoDB, Express, React - _simulated via EJS_, Node.js)** that interfaces with Large Language Models (LLMs) to deliver high-quality, actionable travel advice in a beautiful, readable format.

### User Stories

**User Type: The Spontaneous Traveler**

- **Goal:** Quickly get a 3-day weekend plan for a nearby city without hours of research.
- **Needs:** Fast generation, realistic activities, and budget-friendly options.
- **Pain Point:** "I want to go somewhere this weekend but don't have time to plan."

**User Type: The Cultural Explorer**

- **Goal:** Find "hidden gems" in popular destinations like Sri Lanka or Japan.
- **Needs:** Recommendations for off-the-beaten-path locations, local eateries, and cultural sites that aren't on standard tourist maps.
- **Pain Point:** "Everything online is too touristy; I want an authentic experience."

---

## 🌟 Design Space

### UI Design

The interface focuses on **Minimalism and Clarity**, prioritizing the content (the trip plan) over unnecessary clutter.

- **Home Page:** A clean, inspiring landing page with a simple conversational input form.
- **Results Page:** A beautiful card-based layout for each day of the trip.
- **Responsive:** optimized for mobile travelers who need their itinerary on the go.

### Design Concept

- **Visual Hierarchy:** Key information (Location, Date) is largest. Activity details are collapsible.
- **Feedback Loops:** Loading states and error handling keep the user informed during the specific AI generation delay.

---

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend:** EJS (Embedded JavaScript) for server-side rendering, styled with Custom CSS and Tailwind css.
- **Backend:** Node.js, Express.js.
  - **Redis:** Implements rate limiting to prevent API abuse.
  - **Session Storage:** securely manages temporary user state and trip history.
- **AI Integration:** OpenRouter API / Google Gemini API.

### High-Level Architecture

```mermaid
graph TD
    User[User] -->|Input Preferences| Frontend[Frontend UI (EJS)]
    Frontend -->|POST Request| Controller[Trip Controller]
    Controller -->|Rate Limit Check| Redis[Redis / Memory Store]
    Controller -->|Process Input| Service[AI Service Layer]
    Service -->|Construct Prompt| LLM_API{OpenRouter / Gemini}
    LLM_API -->|JSON Response| Service
    Service -->|Validation & Fill| Controller
    Controller -->|Store Session| DB[(MongoDB / Session)]
    Controller -->|Render View| ResultsPage[Results Page]
```

---

## 🔑 Key Features

1.  **AI-Driven Itineraries**: Uses advanced prompt engineering to force structured JSON responses from LLMs, ensuring consistent and parseable trip data every time.
2.  **Smart Rate Limiting**: Prevents abuse and manages API costs using `express-rate-limit` and Redis cloud.
3.  **Secure Sessions**: Uses `express-session` with signed cookies and rolling expirations to manage user state securely.
4.  **"Hidden Gems" Mode**: A special algorithm toggle that instructs the AI to prioritize non-commercial, authentic local spots over tourist traps.

---

## 🔮 Future Vision

### Short-Term (V2)

- **User Accounts:** Persistent history and "Wishlist" features using MongoDB for long-term storage.
- **PDF Export:** Allow users to download their itinerary as a beautifully formatted PDF.

### Long-Term (V3)

- **Booking Integration:** Direct links to booking platforms (Booking.com/Expedia) for the suggested hotels to monetize the platform.
- **Social Sharing:** Ability to share generated itineraries via public links so friends can collaborate.
- **Real-time Weather:** Integrate OpenWeatherMap to warn users if their trip dates have predicted bad weather.

---

## 🚀 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/UmairStn/Trip-planner.git
    cd Trip-planner
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    OPEN_ROUTER_API_KEY=your_key_here
    GEMINI_API_KEY=your_key_here
    SESSION_SECRET=your_secret_key
    MONGODB_URI=your_mongodb_connection_string
    ```
4.  **Run the application**
    ```bash
    npm run dev
    ```

---

## 👨‍💻 Author

**UmairStn** - [GitHub](https://github.com/UmairStn)
