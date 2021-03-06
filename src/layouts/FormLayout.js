/**
 * FormLayouts are used to wrap {@link OO.ui.FieldsetLayout FieldsetLayouts} when you intend to use browser-based
 * form submission for the fields instead of handling them in JavaScript. Form layouts can be configured with an
 * HTML form action, an encoding type, and a method using the #action, #enctype, and #method configs, respectively.
 *
 *     @example
 *     // Example of a form layout that wraps a fieldset layout
 *     var input1 = new OO.ui.TextInputWidget( {
 *         placeholder: 'Username'
 *     } );
 *     var input2 = new OO.ui.TextInputWidget( {
 *         placeholder: 'Password',
 *         type: 'password'
 *     } );
 *     var submit = new OO.ui.ButtonInputWidget( {
 *         label: 'Submit'
 *     } );
 *
 *     var fieldset = new OO.ui.FieldsetLayout( {
 *         label: 'A form layout'
 *     } );
 *     fieldset.addItems( [
 *         new OO.ui.FieldLayout( input1, {
 *             label: 'Username',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( input2, {
 *             label: 'Password',
 *             align: 'top'
 *         } ),
 *         new OO.ui.FieldLayout( submit )
 *     ] );
 *     var form = new OO.ui.FormLayout( {
 *         items: [ fieldset ],
 *         action: '/api/formhandler',
 *         method: 'get'
 *     } )
 *     $( 'body' ).append( form.$element );
 *
 * @class
 * @extends OO.ui.Layout
 * @mixins OO.ui.GroupElement
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {string} [method] HTML form `method` attribute
 * @cfg {string} [action] HTML form `action` attribute
 * @cfg {string} [enctype] HTML form `enctype` attribute
 * @cfg {OO.ui.FieldsetLayout[]} [items] Fieldset layouts to add to the form layout.
 */
OO.ui.FormLayout = function OoUiFormLayout( config ) {
	// Configuration initialization
	config = config || {};

	// Parent constructor
	OO.ui.FormLayout.super.call( this, config );

	// Mixin constructors
	OO.ui.GroupElement.call( this, $.extend( {}, config, { $group: this.$element } ) );

	// Events
	this.$element.on( 'submit', this.onFormSubmit.bind( this ) );

	// Initialization
	this.$element
		.addClass( 'oo-ui-formLayout' )
		.attr( {
			method: config.method,
			action: config.action,
			enctype: config.enctype
		} );
	if ( Array.isArray( config.items ) ) {
		this.addItems( config.items );
	}
};

/* Setup */

OO.inheritClass( OO.ui.FormLayout, OO.ui.Layout );
OO.mixinClass( OO.ui.FormLayout, OO.ui.GroupElement );

/* Events */

/**
 * A 'submit' event is emitted when the form is submitted.
 *
 * @event submit
 */

/* Static Properties */

OO.ui.FormLayout.static.tagName = 'form';

/* Methods */

/**
 * Handle form submit events.
 *
 * @private
 * @param {jQuery.Event} e Submit event
 * @fires submit
 */
OO.ui.FormLayout.prototype.onFormSubmit = function () {
	this.emit( 'submit' );
	return false;
};
