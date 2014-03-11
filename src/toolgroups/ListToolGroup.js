/**
 * Drop down list layout of tools as labeled icon buttons.
 *
 * @class
 * @abstract
 * @extends OO.ui.PopupToolGroup
 *
 * @constructor
 * @param {OO.ui.Toolbar} toolbar
 * @param {Object} [config] Configuration options
 */
OO.ui.ListToolGroup = function OoUiListToolGroup( toolbar, config ) {
	// Parent constructor
	OO.ui.PopupToolGroup.call( this, toolbar, config );

	// Initialization
	this.$element.addClass( 'oo-ui-listToolGroup' );
};

/* Inheritance */

OO.inheritClass( OO.ui.ListToolGroup, OO.ui.PopupToolGroup );

/* Static Properties */

OO.ui.ListToolGroup.static.accelTooltips = true;