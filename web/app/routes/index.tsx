import ProtectedRoute from "../components/ProtectedRoute";
import ChangePassword from "../pages/ChangePassword";
import Games from "../pages/Games";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import GameForm from "../pages/admin/GameForm";
import AdminGames from "../pages/admin/Games";
import PlaceConnectionForm from "../pages/admin/PlaceConnectionForm";
import PlaceConnections from "../pages/admin/PlaceConnections";
import PlaceForm from "../pages/admin/PlaceForm";
import PlaceTypes from "../pages/admin/PlaceTypes";
import Places from "../pages/admin/Places";
import Players from "../pages/admin/Players";
import Transactions from "../pages/admin/Transactions";
import VehicleTypes from "../pages/admin/VehicleTypes";

export const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/settings/change-password",
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/games",
    element: (
      <ProtectedRoute>
        <Games />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/place-types",
    element: (
      <ProtectedRoute>
        <PlaceTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/vehicle-types",
    element: (
      <ProtectedRoute>
        <VehicleTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/places",
    element: (
      <ProtectedRoute>
        <Places />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/places/add",
    element: (
      <ProtectedRoute>
        <PlaceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/places/:id/edit",
    element: (
      <ProtectedRoute>
        <PlaceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/place-connections",
    element: (
      <ProtectedRoute>
        <PlaceConnections />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/place-connections/add",
    element: (
      <ProtectedRoute>
        <PlaceConnectionForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/place-connections/:id/edit",
    element: (
      <ProtectedRoute>
        <PlaceConnectionForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/games",
    element: (
      <ProtectedRoute>
        <AdminGames />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/games/new",
    element: (
      <ProtectedRoute>
        <GameForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/games/:id/edit",
    element: (
      <ProtectedRoute>
        <GameForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/players",
    element: (
      <ProtectedRoute>
        <Players />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/transactions",
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
]; 