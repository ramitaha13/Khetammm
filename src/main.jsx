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
import Emailimportant from "../src/components/emailimportant.jsx";
import Addemail from "../src/components/addemail.jsx";
import Writedoce from "../src/components/writedoce.jsx";
import Address from "../src/components/address.jsx";
import Addaddress from "../src/components/addaddress.jsx";
import Pastdates from "../src/components/pastdates.jsx";
import Tasks from "../src/components/Tasks.jsx";
import AddTasks from "../src/components/addTasks.jsx";
import Settings from "../src/components/settings.jsx";
import Websites from "../src/components/websites.jsx";
import Addwebsite from "../src/components/addwebsite.jsx";

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
  {
    path: "/emailimportant",
    element: <Emailimportant />,
  },
  {
    path: "/addemail",
    element: <Addemail />,
  },
  {
    path: "/writedoce",
    element: <Writedoce />,
  },
  {
    path: "/address",
    element: <Address />,
  },
  {
    path: "/addaddress",
    element: <Addaddress />,
  },
  {
    path: "/pastdates",
    element: <Pastdates />,
  },
  {
    path: "/Tasks",
    element: <Tasks />,
  },
  {
    path: "/addTasks",
    element: <AddTasks />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/websites",
    element: <Websites />,
  },
  {
    path: "/addwebsite",
    element: <Addwebsite />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
