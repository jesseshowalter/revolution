/**
 * Generates resource tree accordion, with
 * each context separated
 *
 * @class MODx.tree.SimpleResource
 * @extends MODx.tree.Tree
 * @param {Object} config An object of options.
 * @xtype modx-tree-resource-simple
 * @see https://github.com/rthrash/revolution/blob/develop/manager/assets/modext/widgets/resource/modx.tree.resource.js
 */
MODx.panel.ResourceAccordionPanel = function(config) {
    config = config || {};

    Ext.apply(config,{
        border: false
        ,baseCls: 'modx-panel'
        ,fill: true
        ,autoHeight: true
        ,collapsed: true
        ,cls: 'modx-resource-accordion'
        ,tools: [{
                id: 'edit',
                handler: function(){
                    document.location.href = '?a=context/update&key='+config.contextKey
                },
                scope: this,
                qtip: "Edit context"
            },{
                id: 'toggle',
                handler: function(){
                        this.toggleCollapse()
                    },
                scope:this
            }]
        ,listeners: {
            render: {fn:this._onRender,scope:this},
            beforeexpand: {fn: function(){
                    this.header.addClass('modx-panel-header-expanded');
                    this.ownerCt.onPanelExpand(this);
                },scope:this},
            beforecollapse: {fn: function(){
                this.header.removeClass('modx-panel-header-expanded');
                },scope:this}
        }
        ,items: [{
            xtype: 'modx-tree-contextresources'
            ,contextKey: config.contextKey
        }]
    });



    MODx.panel.ResourceAccordionPanel.superclass.constructor.call(this,config);

};
Ext.extend(MODx.panel.ResourceAccordionPanel,Ext.Panel,{

    _onRender: function(){
        // Bind click events to panel headers
        this.header.on('click',this._onHeaderClick,this)
    },

    _onHeaderClick: function(){
        this.toggleCollapse();
    },

    refresh: function(){
        this.items.items[0].refresh()
    }

    ,expandTree: function(){
        this.items.items[0].expandAll();
    }

    ,collapseTree: function(){
        this.items.items[0].collapseAll();
    }

    ,updateEmptyStatus: function( empty){
        this.noResources = empty;
        // Update the panel title
        var title = this.initialConfig.title;
            title += empty? ' <span class="faded">'+_('empty_template')+'</span>' : '';
        this.setTitle(title);

    }

});
Ext.reg('modx-panel-resource-accordion-panel',MODx.panel.ResourceAccordionPanel);
