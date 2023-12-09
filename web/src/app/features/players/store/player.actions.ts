import { AbstractActions } from '../../../helpers/abstract.actions';
import { PlayerDto } from '../../../models/player';

class PlayerActionsType extends AbstractActions<PlayerDto> {
  constructor() {
    super('Player');
  }
}

export const PlayerActions = new PlayerActionsType();
