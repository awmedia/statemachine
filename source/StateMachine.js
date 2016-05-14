import EventEmitter from 'eventemitter3'

/**
 * StateMachine
 * Simple flexible state machine for JS.
 * @event   actioncall      {stateMachine, result}
 * @event   statechanged    {stateMachine, newState, previousState}
 * @author  Jerry Sietsma
 */
class StateMachine extends EventEmitter {
    constructor(config) {
        super();

        config = Object.assign({
            /**
             * @cfg     array   Array with available actions. Action proxy methods will be dynamically created for all actions
             * @required
             */
            actions: null,

            /**
             * @cfg     object  Object with states mapped to state delegates. The states are the names and the delegate will handle to action methods
             * @required
             */
            states: null,

            /**
             * @cfg     string  The initial state for this state machine
             * @required
             */
            initialState: null
        }, config);

        ['actions', 'states', 'initialState'].forEach(property => {
            if (config[property] === null || config[property] === undefined) {
                throw new Error('Config property: "${property}" is required.');
            }
        });

        this._states = config.states;

        this._initActions(config.actions);

        this._previousState = null;
        this._currentState = config.initialState;

        this._isTransitioning = false;
    }

    /**
     * Public methods
     */

    /**
     * setState
     * The only method that should change the state.
     * When the state machine is in transition, the call will be ignored.
     * @param   string  The new state name
     * @param   object  Transition promise. The transition will be finished after the Promise is resolved.
     *                  Usefull te keep the state machine locked will animating to new state
     */
    setState(newState, transitionPromise = null) {
        if (!this._states[newState]) {
            throw new Error('Cannot set state: "${newState}". Invalid state.');
        }

        if (!this._isTransitioning) {
            this._previousState = this._currentState;
            this._currentState = newState;
            transitionPromise = transitionPromise || Promise.resolve();

            transitionPromise.then(() => {
                this._isTransitioning = false;
                this.emit('statechanged', this, this._currentState, this._previousState);
            });
        }
    }

    /**
     * getState
     * @return  string  The name of the current state
     */
    getState() {
        return this._currentState;
    }

    /**
     * getPreviousState
     * @return  string  The name of the previous state
     */
    getPreviousState() {
        return this._previousState;
    }

    /**
     * isTransitioning
     * Helper method to determine whether the StateMachine is transitioning
     * @return  bool    True if is transitioning, false if not
     */
    isTransitioning() {
        return this._isTransitioning;
    }

    /**
     * Private/protected methods
     */

    /**
     * _initAction
     * Helper method that will create dynamically action proxy methods
     * when they don't exists
     * @param   array   Array with action names
     * @return  void
     */
    _initActions(actions) {
        actions.forEach(action => {
            if (!this[action]) {
                this[action] = function(action, ...args) {
                    return this._callAction(action, ...args)
                }.bind(this, action);
            }
        });

        this._actions = actions;
    }

    /**
     * _callAction
     * The dynamically created action proxy methods will invoke this
     * method to call a specific action.
     * @param   string  The name of the action to call
     * @param   ...     The extra params will be pased to the action delegate
     * @return  mixed   The return result of the action delegate or nothing
     */
    _callAction(action, ...args) {
        let isExistingAction = (this._actions.indexOf(action) !== -1),
            delegate = this._states[this._currentState],
            hasDelegate = !!delegate,
            hasActionMethod = hasDelegate && !!delegate[action],
            isValidCall = (!this._isTransitioning && isExistingAction && hasDelegate && hasActionMethod),
            result;

        if (isValidCall) {
            result = delegate[action](this, ...args);
        }

        this.emit('actioncall', this, result);

        return result;
    }
}

module.exports = StateMachine;
