/**
 * Layout containing a series of pages.
 *
 * @class
 * @extends OO.ui.Layout
 *
 * @constructor
 * @param {Object} [config] Configuration options
 * @cfg {boolean} [continuous=false] Show all pages, one after another
 * @cfg {boolean} [autoFocus=false] Focus on the first focusable element when changing to a page
 * @cfg {boolean} [outlined=false] Show an outline
 * @cfg {boolean} [editable=false] Show controls for adding, removing and reordering pages
 * @cfg {Object[]} [adders List of adders for controls, each with name, icon and title properties
 */
OO.ui.BookletLayout = function OoUiBookletLayout( config ) {
	// Initialize configuration
	config = config || {};

	// Parent constructor
	OO.ui.Layout.call( this, config );

	// Properties
	this.currentPageName = null;
	this.pages = {};
	this.ignoreFocus = false;
	this.stackLayout = new OO.ui.StackLayout( { '$': this.$, 'continuous': !!config.continuous } );
	this.autoFocus = !!config.autoFocus;
	this.outlined = !!config.outlined;
	if ( this.outlined ) {
		this.editable = !!config.editable;
		this.adders = config.adders || null;
		this.outlineControlsWidget = null;
		this.outlineWidget = new OO.ui.OutlineWidget( { '$': this.$ } );
		this.outlinePanel = new OO.ui.PanelLayout( { '$': this.$, 'scrollable': true } );
		this.gridLayout = new OO.ui.GridLayout(
			[this.outlinePanel, this.stackLayout], { '$': this.$, 'widths': [1, 2] }
		);
		if ( this.editable ) {
			this.outlineControlsWidget = new OO.ui.OutlineControlsWidget(
				this.outlineWidget,
				{ '$': this.$, 'adders': this.adders }
			);
		}
	}

	// Events
	this.stackLayout.connect( this, { 'set': 'onStackLayoutSet' } );
	if ( this.outlined ) {
		this.outlineWidget.connect( this, { 'select': 'onOutlineWidgetSelect' } );
		// Event 'focus' does not bubble, but 'focusin' does
		this.stackLayout.onDOMEvent( 'focusin', OO.ui.bind( this.onStackLayoutFocus, this ) );
	}

	// Initialization
	this.$element.addClass( 'oo-ui-bookletLayout' );
	this.stackLayout.$element.addClass( 'oo-ui-bookletLayout-stackLayout' );
	if ( this.outlined ) {
		this.outlinePanel.$element
			.addClass( 'oo-ui-bookletLayout-outlinePanel' )
			.append( this.outlineWidget.$element );
		if ( this.editable ) {
			this.outlinePanel.$element
				.addClass( 'oo-ui-bookletLayout-outlinePanel-editable' )
				.append( this.outlineControlsWidget.$element );
		}
		this.$element.append( this.gridLayout.$element );
	} else {
		this.$element.append( this.stackLayout.$element );
	}
};

/* Inheritance */

OO.inheritClass( OO.ui.BookletLayout, OO.ui.Layout );

/* Events */

/**
 * @event set
 * @param {OO.ui.PageLayout} page Current page
 */

/**
 * @event add
 * @param {OO.ui.PageLayout[]} page Added pages
 * @param {number} index Index pages were added at
 */

/**
 * @event remove
 * @param {OO.ui.PageLayout[]} pages Removed pages
 */

/* Methods */

/**
 * Handle stack layout focus.
 *
 * @method
 * @param {jQuery.Event} e Focusin event
 */
OO.ui.BookletLayout.prototype.onStackLayoutFocus = function ( e ) {
	var name, $target;

	if ( this.ignoreFocus ) {
		// Avoid recursion from programmatic focus trigger in #onStackLayoutSet
		return;
	}

	$target = $( e.target ).closest( '.oo-ui-pageLayout' );
	for ( name in this.pages ) {
		if ( this.pages[ name ].$element[0] === $target[0] ) {
			this.setPage( name );
			break;
		}
	}
};

/**
 * Handle stack layout set events.
 *
 * @method
 * @param {OO.ui.PanelLayout|null} page The page panel that is now the current panel
 */
OO.ui.BookletLayout.prototype.onStackLayoutSet = function ( page ) {
	if ( page ) {
		page.scrollElementIntoView( { 'complete': OO.ui.bind( function () {
			this.ignoreFocus = true;
			if ( this.autoFocus ) {
				page.$element.find( ':input:first' ).focus();
			}
			this.ignoreFocus = false;
		}, this ) } );
	}
};

/**
 * Handle outline widget select events.
 *
 * @method
 * @param {OO.ui.OptionWidget|null} item Selected item
 */
OO.ui.BookletLayout.prototype.onOutlineWidgetSelect = function ( item ) {
	if ( item ) {
		this.setPage( item.getData() );
	}
};

/**
 * Check if booklet has an outline.
 *
 * @method
 * @returns {boolean} Booklet is outlined
 */
OO.ui.BookletLayout.prototype.isOutlined = function () {
	return this.outlined;
};

/**
 * Check if booklet has editing controls.
 *
 * @method
 * @returns {boolean} Booklet is outlined
 */
OO.ui.BookletLayout.prototype.isEditable = function () {
	return this.editable;
};

/**
 * Get the outline widget.
 *
 * @method
 * @returns {OO.ui.OutlineWidget|null} Outline widget, or null if boolet has no outline
 */
OO.ui.BookletLayout.prototype.getOutline = function () {
	return this.outlineWidget;
};

/**
 * Get the outline controls widget. If the outline is not editable, null is returned.
 *
 * @method
 * @returns {OO.ui.OutlineControlsWidget|null} The outline controls widget.
 */
OO.ui.BookletLayout.prototype.getOutlineControls = function () {
	return this.outlineControlsWidget;
};

/**
 * Get a page by name.
 *
 * @method
 * @param {string} name Symbolic name of page
 * @returns {OO.ui.PageLayout|undefined} Page, if found
 */
OO.ui.BookletLayout.prototype.getPage = function ( name ) {
	return this.pages[name];
};

/**
 * Get the current page name.
 *
 * @method
 * @returns {string|null} Current page name
 */
OO.ui.BookletLayout.prototype.getPageName = function () {
	return this.currentPageName;
};

/**
 * Add a page to the layout.
 *
 * When pages are added with the same names as existing pages, the existing pages will be
 * automatically removed before the new pages are added.
 *
 * @method
 * @param {OO.ui.PageLayout[]} pages Pages to add
 * @param {number} index Index to insert pages after
 * @fires add
 * @chainable
 */
OO.ui.BookletLayout.prototype.addPages = function ( pages, index ) {
	var i, len, name, page,
		items = [],
		remove = [];

	for ( i = 0, len = pages.length; i < len; i++ ) {
		page = pages[i];
		name = page.getName();
		if ( name in this.pages ) {
			// Remove page with same name
			remove.push( this.pages[name] );
		}
		this.pages[page.getName()] = page;
		if ( this.outlined ) {
			items.push(
				new OO.ui.OutlineItemWidget( name, {
					'$': this.$,
					'label': page.getLabel() || name,
					'level': page.getLevel(),
					'icon': page.getIcon(),
					'movable': page.isMovable()
				} )
			);
		}
	}
	if ( remove.length ) {
		this.removePages( remove );
	}

	if ( this.outlined && items.length ) {
		this.outlineWidget.addItems( items, index );
		this.updateOutlineWidget();
	}
	this.stackLayout.addItems( pages, index );
	this.emit( 'add', pages, index );

	return this;
};

/**
 * Remove a page from the layout.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.BookletLayout.prototype.removePages = function ( pages ) {
	var i, len, name, page,
		items = [];

	for ( i = 0, len = pages.length; i < len; i++ ) {
		page = pages[i];
		name = page.getName();
		delete this.pages[name];
		if ( this.outlined ) {
			items.push( this.outlineWidget.getItemFromData( name ) );
		}
	}
	if ( this.outlined && items.length ) {
		this.outlineWidget.removeItems( items );
		this.updateOutlineWidget();
	}
	this.stackLayout.removeItems( pages );
	this.emit( 'remove', pages );

	return this;
};

/**
 * Clear all pages from the layout.
 *
 * @method
 * @fires remove
 * @chainable
 */
OO.ui.BookletLayout.prototype.clearPages = function () {
	var pages = this.stackLayout.getItems();

	this.pages = {};
	this.currentPageName = null;
	if ( this.outlined ) {
		this.outlineWidget.clearItems();
	}
	this.stackLayout.clearItems();

	this.emit( 'remove', pages );

	return this;
};

/**
 * Set the current page by name.
 *
 * @method
 * @fires set
 * @param {string} name Symbolic name of page
 */
OO.ui.BookletLayout.prototype.setPage = function ( name ) {
	var selectedItem,
		page = this.pages[name];

	if ( this.outlined ) {
		selectedItem = this.outlineWidget.getSelectedItem();
		if ( selectedItem && selectedItem.getData() !== name ) {
			this.outlineWidget.selectItem( this.outlineWidget.getItemFromData( name ) );
		}
	}

	if ( page ) {
		this.currentPageName = name;
		this.stackLayout.setItem( page );
		this.emit( 'set', page );
	}
};

/**
 * Call this after adding or removing items from the OutlineWidget.
 *
 * @method
 * @chainable
 */
OO.ui.BookletLayout.prototype.updateOutlineWidget = function () {
	// Auto-select first item when nothing is selected anymore
	if ( !this.outlineWidget.getSelectedItem() ) {
		this.outlineWidget.selectItem( this.outlineWidget.getFirstSelectableItem() );
	}

	return this;
};