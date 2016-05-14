import StateMachine from '../source/StateMachine'

/**
 * TrafficLight
 * Context class
 */
class TrafficLight {
    constructor() {
        this._stateMachine = new TrafficLightStateMachine();
    }
}

class TrafficLightStateMachine extends StateMachine {
    constructor(config) {
        config = Object.assign({
            actions: ['pass', 'warn', 'stop'],
            initialState: 'RED',
            states: {
                'GREEN': new TrafficLightStateGreen(),
                'ORANGE': new TrafficLightStateOrange(),
                'RED': new TrafficLightStateRed()
            }
        }, config);

        super(config);
    }
}

class TrafficLightState {
    constructor(config) {
        config = Object.assign({
            // define config for state instances
        }, config);
    }
}

class TrafficLightStateGreen extends TrafficLightState {
    warn(stateMachine) {
        stateMachine.setState('ORANGE');
    }

    stop(stateMachine) {
        throw new Error('Cannot go to RED from GREEN');
    }

    onEnterState(stateMachine) {
        this._timeoutToWarn = setTimeout(stateMachine.warn, 8000);
    }

    onExitState() {
        if (this._timeoutToWarn) {
            clearTimeout(this._timeoutToWarn);
        }
    }
}

class TrafficLightStateOrange extends TrafficLightState {
    stop(stateMachine) {
        stateMachine.setState('RED');
    }

    pass(stateMachine) {
        throw new Error('Cannot go to GREEN from ORANGE');
    }

    onEnterState(stateMachine) {
        this._timeoutToStop = setTimeout(stateMachine.stop, 2000);
    }

    onExitState() {
        if (this._timeoutToStop) {
            clearTimeout(this._timeoutToStop);
        }
    }
}

class TrafficLightStateRed extends TrafficLightState {
    pass(stateMachine) {
        stateMachine.setState('GREEN');
    }

    warn(stateMachine) {
        throw new Error('Cannot go to ORANGE from RED');
    }

    onEnterState(stateMachine) {
        this._timeoutToPass = setTimeout(stateMachine.green, 6000);
    }

    onExitState() {
        if (this._timeoutToPass) {
            clearTimeout(this._timeoutToPass);
        }
    }
}

module.exports = {
    TrafficLightStateMachine,
    TrafficLightState,
    TrafficLightStateGreen,
    TrafficLightStateOrange,
    TrafficLightStateRed
}
