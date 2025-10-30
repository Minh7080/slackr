import { useState } from '../lib/hooks.js';

const [getSelectedChannelId, setSelectedChannelId, subSelectedChannelId] = useState(-1);
const [getChannels, setChannels, subChannels] = useState([]);

export {
  getSelectedChannelId,
  setSelectedChannelId,
  subSelectedChannelId,
  getChannels,
  setChannels,
  subChannels,
};
