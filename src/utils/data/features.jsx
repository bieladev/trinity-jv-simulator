import React from 'react';
import {
  HomeWorkOutlined as HomeWorkOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  InsightsOutlined as InsightsOutlinedIcon,
} from '@mui/icons-material';

export const features = [
  {
    icon: <HomeWorkOutlinedIcon />,
    title: "Real estate partnership",
    description: "Institutional land ownership meets private development, with costs shared 50/50."
  },
  {
    icon: <TrendingUpOutlinedIcon />,
    title: "Equity growth",
    description: "Appreciation sharing and flexible exit options on an equal partnership structure."
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: "Stakeholder value",
    description: "Berkshire Hathaway, DR Horton and the homeowner in one balanced partnership."
  },
  {
    icon: <InsightsOutlinedIcon />,
    title: "Hold-period analysis",
    description: "Cash flows, equity growth and outcomes projected to each scenario's exit year."
  }
];
