import { Component, OnInit } from '@angular/core';
import {AuthState, register} from '../../store';
import {Store} from '@ngrx/store';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { UiService } from '../../../../services/ui.service';

@Component({
  selector: 'trains-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: UntypedFormGroup;

  constructor(
    private readonly store: Store<AuthState>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly uiService: UiService
  ) { }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.register.title');
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    // stop here if form is invalid
    if (this.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.store.dispatch(register({username: this.f.username.value, email: this.f.email.value, password: this.f.password.value}))
  }
}
