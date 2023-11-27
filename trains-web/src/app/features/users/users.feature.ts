import { FeaturePart } from '../../utils/feature-part';
import { UserPreferenceService } from './services/user-preference.service';
import { UserService } from './services/user.service';

export const USERS_FEATURE: FeaturePart = {
  imports: [],
  declarations: [],
  providers: [
    UserService,
    UserPreferenceService,
  ],
  routes: []
};

