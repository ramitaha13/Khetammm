import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "../src/components/home.jsx";
import Login from "../src/components/login.jsx";
import Mainpage from "../src/components/mainpage.jsx";
import Notes from "../src/components/notes.jsx";
import Addnote from "../src/components/addnote.jsx";
import Importantdates from "../src/components/importantdates.jsx";
import Adddate from "../src/components/adddate.jsx";
import Nowdate from "../src/components/nowdate.jsx";
import Numbers from "../src/components/numbers.jsx";
import Addnumbers from "../src/components/addnumbers.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/mainpage",
    element: <Mainpage />,
  },
  {
    path: "/notes",
    element: <Notes />,
  },
  {
    path: "/addnote",
    element: <Addnote />,
  },
  {
    path: "/importantdates",
    element: <Importantdates />,
  },
  {
    path: "/adddate",
    element: <Adddate />,
  },
  {
    path: "/nowdate",
    element: <Nowdate />,
  },
  {
    path: "/numbers",
    element: <Numbers />,
  },
  {
    path: "/addnumbers",
    element: <Addnumbers />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
