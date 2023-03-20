import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';

import { authActions } from '../../store';

export { Login };

function Login() {
  const dispatch = useDispatch();

  // form validation rules 
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm(formOptions);
  const { errors, isSubmitting } = formState;
  const navigate = useNavigate();

  function onSubmit({ username, password }) {
    return dispatch(authActions.login({ username, password }));
  }

  return (
    <div className="card m-3">
      <h4 className="card-header">Login</h4>
      <div className="card-body">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input name="username" type="text" {...register('username')} className={`form-control ${errors.username ? 'is-invalid' : ''}`} />
            <div className="invalid-feedback">{errors.username?.message}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
            <div className="invalid-feedback">{errors.password?.message}</div>
          </div>
          <Button type="submit" disabled={isSubmitting} variant="primary">
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
            Login
          </Button>
          <Button variant="link" onClick={() => navigate('../register')}>Register</Button>
        </form>
      </div>
    </div>
  )
}
