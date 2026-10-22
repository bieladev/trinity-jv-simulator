import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import {
  ShowChartOutlined as ShowChartOutlinedIcon,
  EventOutlined as EventOutlinedIcon,
  BalanceOutlined as BalanceOutlinedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
} from '@mui/icons-material';
import SectionHeading from '../common/SectionHeading';
import Reveal from '../common/Reveal';

// "What the tool is for": four uses, each tied to something the simulator
// actually does (presets, exit options, share settings, one calculation).
const USES = [
  {
    icon: <ShowChartOutlinedIcon />,
    title: 'Test the deal in different markets',
    body: 'Run the same structure from a 6% appreciation market to a flat or declining one, and at different mortgage rates.',
  },
  {
    icon: <EventOutlinedIcon />,
    title: 'Compare exits and refinancing',
    body: 'See how an early sale, a foreclosure or a cash-out refinance during the hold changes what each party puts in and takes out.',
  },
  {
    icon: <BalanceOutlinedIcon />,
    title: 'Check the split is fair to all three parties',
    body: 'Adjust the appreciation and interest splits, or let balanced return mode set the partner shares so DR Horton and Berkshire earn the same annualized return.',
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: 'Share one consistent model with both teams',
    body: 'The summary, results, charts and comparison all run on one calculation, so DR Horton and Berkshire see the same figures from the same assumptions.',
  },
];

function ToolPurpose() {
  return (
    <Box component="section" aria-labelledby="tool-purpose-title" sx={{ pt: 7 }}>
      <Container>
        <SectionHeading
          eyebrow="What the tool is for"
          title={<span id="tool-purpose-title">Questions the simulator answers</span>}
          description="Each scenario shows every party's capital, appreciation share, profit and annualized return through to exit."
        />
        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}
        >
          {USES.map((use, index) => (
            <Reveal
              component="li"
              index={index}
              key={use.title}
              className="motion-lift"
              sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '6px', boxShadow: 2, p: { xs: 2, md: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Box sx={{ color: 'brand.primaryText', display: 'flex', mb: 0.5, '& svg': { fontSize: 24 } }} aria-hidden>
                {use.icon}
              </Box>
              <Typography variant="h5" component="h3">{use.title}</Typography>
              <Typography variant="body2" color="text.secondary">{use.body}</Typography>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ToolPurpose;
