import TickSystem from '../../entitySystem/system/tick/TickSystem';
import TickEngine, {BeginTicker, EndTicker} from './TickEngine';
import TickEngineBuilder from './TickEngineBuilder';

export class OnOrBuildClause {
  constructor(protected readonly builder: TickEngineBuilder) {
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
  constructor(private readonly builder: TickEngineBuilder, private readonly isOnUpdate: boolean) {
  }

  apply(system: TickSystem): AtClause {
    return new AtClause(this.builder, this.isOnUpdate, system);
  }
}

class AtClause {
  constructor(private builder: TickEngineBuilder, private isOnUpdate: boolean, private system: TickSystem) {
  }

  atEnter(): ApplyOrOnOrBuildClause {
    this.builder.apply(new BeginTicker(this.system), this.isOnUpdate);
    return new ApplyOrOnOrBuildClause(this.builder, this.isOnUpdate);
  }

  atExit(): ApplyOrOnOrBuildClause {
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
