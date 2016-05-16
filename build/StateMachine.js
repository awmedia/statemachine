'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * StateMachine
 * Simple flexible state machine for JS.
 * @event   actioncall      {stateMachine, result}
 * @event   statechanged    {stateMachine, newState, previousState}
 * @author  Jerry Sietsma
 */

var StateMachine = function (_EventEmitter) {
    _inherits(StateMachine, _EventEmitter);

    function StateMachine(config) {
        _classCallCheck(this, StateMachine);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StateMachine).call(this));

        config = Object.assign({
            /**
             * @cfg     array   Array with available actions. Action proxy methods will be dynamically created for all actions
             * @required
             */
            actions: null,

            /**
             * @cfg     object  Object with states mapped to state delegates. The states are the names and the delegate will handle the action methods
             * @required
             */
            states: null,

            /**
             * @cfg     string  The initial state for this state machine
             * @required
             */
            initialState: null
        }, config);

        ['actions', 'states', 'initialState'].forEach(function (property) {
            if (config[property] === null || config[property] === undefined) {
                throw new Error('Config property: "${property}" is required.');
            }
        });

        _this._states = config.states;

        _this._initActions(config.actions);

        _this._previousState = null;
        _this._currentState = config.initialState;

        _this._isTransitioning = false;
        return _this;
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
     *                  Usefull te keep the state machine locked while animating to new state
     */


    _createClass(StateMachine, [{
        key: 'setState',
        value: function setState(newState) {
            var _this2 = this;

            var transitionPromise = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (!this._states[newState]) {
                throw new Error('Cannot set state: "${newState}". Invalid state.');
            }

            if (!this._isTransitioning) {
                this._previousState = this._currentState;
                this._currentState = newState;
                transitionPromise = transitionPromise || Promise.resolve();

                transitionPromise.then(function () {
                    _this2._isTransitioning = false;
                    _this2.emit('statechanged', _this2, _this2._currentState, _this2._previousState);
                });
            }
        }

        /**
         * getState
         * @return  string  The name of the current state
         */

    }, {
        key: 'getState',
        value: function getState() {
            return this._currentState;
        }

        /**
         * getPreviousState
         * @return  string  The name of the previous state
         */

    }, {
        key: 'getPreviousState',
        value: function getPreviousState() {
            return this._previousState;
        }

        /**
         * isTransitioning
         * Helper method to determine whether the StateMachine is transitioning
         * @return  bool    True if is transitioning, false if not
         */

    }, {
        key: 'isTransitioning',
        value: function isTransitioning() {
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

    }, {
        key: '_initActions',
        value: function _initActions(actions) {
            var _this3 = this;

            actions.forEach(function (action) {
                if (!_this3[action]) {
                    _this3[action] = function (action) {
                        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                            args[_key - 1] = arguments[_key];
                        }

                        return this._callAction.apply(this, [action].concat(args));
                    }.bind(_this3, action);
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

    }, {
        key: '_callAction',
        value: function _callAction(action) {
            var isExistingAction = this._actions.indexOf(action) !== -1,
                delegate = this._states[this._currentState],
                hasDelegate = !!delegate,
                hasActionMethod = hasDelegate && !!delegate[action],
                isValidCall = !this._isTransitioning && isExistingAction && hasDelegate && hasActionMethod,
                result = void 0;

            if (isValidCall) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                result = delegate[action].apply(delegate, [this].concat(args));
            }

            this.emit('actioncall', this, result);

            return result;
        }
    }]);

    return StateMachine;
}(_eventemitter2.default);

module.exports = StateMachine;
