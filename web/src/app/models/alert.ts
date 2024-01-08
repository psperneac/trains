import {assign} from 'lodash-es';

// @ts-ignore
export class Alert {
  id: string;
  type: AlertType;
  message: string;
  autoClose: boolean;
  keepAfterRouteChange: boolean;
  fade: boolean;

  constructor(init?:Partial<Alert>) {
    assign(this, init);
  }
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}
