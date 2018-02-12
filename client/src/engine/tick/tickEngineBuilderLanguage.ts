import TickEngineBuilder from './TickEngineBuilder';
import TickEngine, {BeginTicker, EndTicker} from './TickEngine';
import TickSystem from '../../entitySystem/system/tick/TickSystem';

export class OnOrBuildClause {
  constructor(protected builder: TickEngineBuilder) {
  }

  onUpdate(): ApplyClause {
    return new ApplyClause(this.builder, true);
  }

  onRender(): ApplyClause {
    return new ApplyClause(this.builder, false);
  }

  build(): TickEngine {
    return this.builder.build();
  }
}

class ApplyClause {
  constructor(private builder: TickEngineBuilder, private isOnUpdate: boolean) {
  }

  apply(system: TickSystem): AtClause {
    return new AtClause(this.builder, this.isOnUpdate, system);
  }
}

class AtClause {
  constructor(private builder: TickEngineBuilder, private isOnUpdate: boolean, private system: TickSystem) {
  }

  atEnter(): OnOrBuildClause {
    this.builder.apply(new BeginTicker(this.system), this.isOnUpdate);
    return new ApplyOrOnOrBuildClause(this.builder, this.isOnUpdate);
  }

  atExit(): OnOrBuildClause {
    this.builder.apply(new EndTicker(this.system), this.isOnUpdate);
    return new ApplyOrOnOrBuildClause(this.builder, this.isOnUpdate);
  }
}

class ApplyOrOnOrBuildClause extends OnOrBuildClause {
  constructor(builder: TickEngineBuilder, private isOnUpdate: boolean) {
    super(builder);
  }

  apply(system: TickSystem): AtClause {
    return new AtClause(this.builder, this.isOnUpdate, system);
  }
}
