import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { history, parseJwt } from '../helpers';

export { PrivateRoute };

function PrivateRoute() {
    const auth = useSelector(x => x.auth.value);
    console.log('PrivateRoute', auth);

    if (auth?.authorization) {
        console.log('PrivateRoute.token', parseJwt(auth.authorization));
    }

    if (!auth) {
        // not logged in so redirect to login page with the return url
        return <Navigate to="/account/login" replace={true} state={{ from: history.location }} />
    }

    // authorized so return outlet for child routes
    return <Outlet />;
}
