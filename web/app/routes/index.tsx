import ProtectedRoute from "../components/ProtectedRoute";
import ChangePassword from "../pages/ChangePassword";
import Games from "../pages/Games";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SelectStartingPlace from "../pages/SelectStartingPlace";
import GameForm from "../pages/admin/GameForm";
import AdminGames from "../pages/admin/Games";
import PlaceConnectionForm from "../pages/admin/PlaceConnectionForm";
import PlaceConnections from "../pages/admin/PlaceConnections";
import PlaceForm from "../pages/admin/PlaceForm";
import PlaceTypes from "../pages/admin/PlaceTypes";
import Places from "../pages/admin/Places";
import Players from "../pages/admin/Players";
import Transactions from "../pages/admin/Transactions";
import Users from "../pages/admin/Users";
import VehicleTypes from "../pages/admin/VehicleTypes";
import Vehicles from "../pages/admin/Vehicles";
import VehicleForm from "../pages/admin/VehicleForm";

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
    path: "/select-starting-place/:playerId",
    element: (
      <ProtectedRoute>
        <SelectStartingPlace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/place-types",
    element: (
      <ProtectedRoute>
        <PlaceTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/vehicle-types",
    element: (
      <ProtectedRoute>
        <VehicleTypes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/vehicles",
    element: (
      <ProtectedRoute>
        <Vehicles />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/vehicles/add",
    element: (
      <ProtectedRoute>
        <VehicleForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/vehicles/:id/edit",
    element: (
      <ProtectedRoute>
        <VehicleForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/places",
    element: (
      <ProtectedRoute>
        <Places />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/places/add",
    element: (
      <ProtectedRoute>
        <PlaceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/places/:id/edit",
    element: (
      <ProtectedRoute>
        <PlaceForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/place-connections",
    element: (
      <ProtectedRoute>
        <PlaceConnections />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/place-connections/add",
    element: (
      <ProtectedRoute>
        <PlaceConnectionForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/place-connections/:id/edit",
    element: (
      <ProtectedRoute>
        <PlaceConnectionForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/games",
    element: (
      <ProtectedRoute>
        <AdminGames />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/games/new",
    element: (
      <ProtectedRoute>
        <GameForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/games/:id/edit",
    element: (
      <ProtectedRoute>
        <GameForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/players",
    element: (
      <ProtectedRoute>
        <Players />
      </ProtectedRoute>
    ),
  },
  {
    path: "/game-admin/transactions",
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
];