export class ModuleTokens {

  public service: symbol;
  public controller: symbol;
  public repository: symbol;
  public mapper: symbol;
  public mappedProperties: symbol;

  constructor(private readonly name: string) {
    this.service = Symbol(name + '_SERVICE');
    this.controller = Symbol(name + '_CONTROLLER');
    this.repository = Symbol(name + '_REPOSITORY');
    this.mapper = Symbol(name + '_MAPPER');
    this.mappedProperties = Symbol(name + '_MAPPED_PROPERTIES');
  }
}