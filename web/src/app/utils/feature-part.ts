// NgModule + routes
import {ModuleWithProviders, Provider, Type} from "@angular/core";
import {Routes} from "@angular/router";

export interface FeaturePart {
  imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>,
  declarations?: Array<Type<any> | any[]>;
  providers?: Provider[];
  routes?: Routes
}
