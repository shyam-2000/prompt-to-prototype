import React, { useState } from 'react';
import { Plugin } from '../types';
import { Button, Dialog, Badge, Input } from './ui/Primitives';
import { Search, Map, Youtube, Code, Check, Plus, Box } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plugins: Plugin[];
  onTogglePlugin: (id: string) => void;
}

const PluginMarketplace: React.FC<Props> = ({ isOpen, onClose, plugins, onTogglePlugin }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'search': return <Search className="w-6 h-6 text-blue-400" />;
      case 'map': return <Map className="w-6 h-6 text-emerald-400" />;
      case 'youtube': return <Youtube className="w-6 h-6 text-red-400" />;
      case 'code': return <Code className="w-6 h-6 text-yellow-400" />;
      default: return <Box className="w-6 h-6 text-gray-400" />;
    }
  };

  const filteredPlugins = plugins.filter(plugin => 
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Plugin Marketplace">
      <div className="space-y-6">
        <div className="bg-indigo-900/20 border border-indigo-900/50 p-4 rounded-lg">
          <h3 className="text-indigo-400 font-medium mb-1">Enhance your Studio</h3>
          <p className="text-sm text-gray-400">Install Google plugins to unlock new capabilities in the Presentation Studio and Intelligence Hubs.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          <Input 
            placeholder="Search plugins..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredPlugins.length > 0 ? (
            filteredPlugins.map(plugin => (
              <div 
                key={plugin.id} 
                className="flex items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl hover:border-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gray-950 border border-gray-800 group-hover:scale-105 transition-transform`}>
                    {getIcon(plugin.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-200">{plugin.name}</h4>
                      {plugin.installed && (
                        <Badge className="bg-emerald-950 text-emerald-500 border-emerald-900">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{plugin.description}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onTogglePlugin(plugin.id)}
                  variant={plugin.installed ? "outline" : "default"}
                  size="sm"
                  className={plugin.installed ? "border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-900" : ""}
                >
                  {plugin.installed ? (
                     <span className="flex items-center gap-1">Active <Check className="w-3 h-3" /></span>
                  ) : (
                     <span className="flex items-center gap-1">Install <Plus className="w-3 h-3" /></span>
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No plugins found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default PluginMarketplace;