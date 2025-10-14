import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import GameForm from "../pages/admin/GameForm";
import Games from "../pages/admin/Games";
import PlaceForm from "../pages/admin/PlaceForm";
import PlaceTypes from "../pages/admin/PlaceTypes";
import Places from "../pages/admin/Places";
import VehicleTypes from "../pages/admin/VehicleTypes";

export const routes = [
  {
    path: "/login",
    element: <Login />,
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
    path: "/admin/games",
    element: (
      <ProtectedRoute>
        <Games />
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
]; 