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
MODx.panel.ResourceAccordion = function(config) {
    config = config || {};
    Ext.apply(config,{
        border: false
        ,anchor: '100%'
        ,baseCls: 'modx-panel'
        ,extraCls: 'modx-tree-accordion'
        ,id: 'modx-resource-accordion'
        ,autoScroll: true
        ,minHeight: 180
        ,autoHeight: true
        ,remoteToolbar: true
        ,remoteToolbarUrl: MODx.config.connectors_url+'resource/index.php'
        ,listeners: {
            afterrender: {fn:this._onAfterRender,scope:this},
            drop: {fn:this._onDrop,scope:this}
        }
        ,tbar: {}
    });

//
//    // Get the dynamic toolbar
//    Ext.Ajax.request({
//        url: config.remoteToolbarUrl || config.url
//        ,params: {
//            action: config.remoteToolbarAction || 'getToolbar'
//        }
//        ,success: function(r) {
//            r = Ext.decode(r.responseText);
//            var itms = this._formatToolbar(r.object);
//            var tb = this.getTopToolbar();
//            if (tb) {
//                for (var i=0;i<itms.length;i++) {
//                    tb.add(itms[i]);
//                }
//                tb.doLayout();
//            }
//        }
//        ,scope:this
//    });
//    config.tbar = {bodyStyle: 'padding: 0'};
//
//
//    // Get the context list
//    Ext.Ajax.request({
//        url: MODx.config.connectors_url+"context/index.php"
//        ,params: {
//            action: 'getlist'
//        },
//        success: function(r){
//            var data = Ext.util.JSON.decode(r.responseText);
//            this._onContextListRecieved(data);
//        },
//        scope: this
//    })
//

    MODx.panel.ResourceAccordion.superclass.constructor.call(this,config);


};
Ext.extend(MODx.panel.ResourceAccordion,MODx.Panel,{

    activePanel: false


    ,addSearchToolbar: function() {
        var t = Ext.get('modx-resource-accordion_tb');
        var fbd = t.createChild({tag: 'div' ,cls: 'modx-formpanel' ,autoHeight: true, id: 'modx-resource-searchbar'});
        var tb = new Ext.Toolbar({
            applyTo: fbd
            ,autoHeight: true
            ,width: '100%'
        });
        var tf = new Ext.form.TextField({
            name: 'search'
            ,value: ''
            ,ctCls: 'modx-leftbar-second-tb'
            ,width: Ext.getCmp('modx-resource-tree').getWidth() - 12
            ,emptyText: _('search_ellipsis')
            ,listeners: {
                'change': {fn: this.search,scope:this}
                ,'render': {fn: function(cmp) {
                    new Ext.KeyMap(cmp.getEl(), {
                        key: Ext.EventObject.ENTER
                        ,fn: function() {
                            this.fireEvent('change',this.getValue());
                            this.blur();
                            return true;}
                        ,scope: cmp
                    });
                },scope:this}
            }
        });
        tb.add(tf);
        tb.doLayout();
        this.searchBar = tb;
        this.on('resize', function(){
            tf.setWidth(this.getWidth() - 12);
        }, this);
    }

    /**
     * Add Items to the toolbar.
     */
    ,_formatToolbar: function(a) {
        var l = a.length;
        for (var i = 0; i < l; i++) {
            if (a[i].handler) {
                a[i].handler = eval(a[i].handler);
            }
            Ext.applyIf(a[i],{
                scope: this
                ,cls: this.toolbarItemCls || 'x-btn-icon'
            });
        }
        return a;
    }


    ,_onAfterRender: function(){

        // Load the toolbar
        if (this.remoteToolbar === true) {
            Ext.Ajax.request({
                url: this.remoteToolbarUrl || this.url
                ,params: {
                    action: this.remoteToolbarAction || 'getToolbar'
                }
                ,success: function(r) {
                    r = Ext.decode(r.responseText);
                    var itms = this._formatToolbar(r.object);
                    var tb = this.getTopToolbar();
                    if (tb) {
                        for (var i=0;i<itms.length;i++) {
                            tb.add(itms[i]);
                        }
                        tb.doLayout();
                    }
                }
                ,scope:this
            });
        }
        // Get the context list
        Ext.Ajax.request({
            url: MODx.config.connectors_url+"context/index.php"
            ,params: {
                action: 'getlist'
            },
            success: function(r){
                var data = Ext.util.JSON.decode(r.responseText);
                this._onContextListRecieved(data);
            },
            scope: this
        })

    }

    ,_onDrop: function(){}




    /**
     * Handle response from ajax request for contexts
     */
    ,_onContextListRecieved: function( data ){
        var panels = [];
        // Create panel config
        for(var k=0;k<data.results.length;k++){
            var ctx = data.results[k];
            if(ctx.key == 'mgr') continue;
            // Create panel object
            var panel = {
                xtype: 'modx-panel-resource-accordion-panel',
                title: ctx.name,
                contextKey: ctx.key
            };
            // Make sure web is at the top
            if(ctx.key == 'web'){
                panels.unshift(panel);
            } else {
                panels.push(panel);
            }
        }
        this.add(panels);
        this.doLayout();

        console.log(this.items.items[0].expand())

        this.activePanel = this.items.items[0];
    }


    /**
     * Called when a context panel is expanded
     */
    ,onPanelExpand: function(panel){
        this.activePanel = panel;
    }


    /**
     * Refresh all context trees
     */
    ,refresh: function(){
        for(var k=0;k<this.items.items.length;k++){
            if(!this.items.items[k].collapsed){
                this.items.items[k].refresh();
            }
        }
    }


    /**
     * Redirect to a different page
     */
    ,redirect: function(url){
        url = url.replace('&context_key=web','&context_key='+this.activePanel.contextKey)
        MODx.loadPage(url);
    }

    ,collapseAll: function(){
        if(this.activePanel){
            this.activePanel.collapseTree();
        }
    }

    ,expandAll: function(){
        if(this.activePanel){
            this.activePanel.expandTree();
        }
    }

    ,emptyRecycleBin: function(){
        console.log('empty recycle bin');
    }

    ,showFilter: function(){
        console.log('show filter');
    }

});
Ext.reg('modx-panel-resource-accordion',MODx.panel.ResourceAccordion);
