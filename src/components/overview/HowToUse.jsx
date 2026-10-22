import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import {
  ViewListOutlined as ViewListOutlinedIcon,
  TuneOutlined as TuneOutlinedIcon,
  InsightsOutlined as InsightsOutlinedIcon,
} from '@mui/icons-material';
import SectionHeading from '../common/SectionHeading';
import Reveal from '../common/Reveal';
import { motion } from '../../utils/motion';
import { primaryScenarios, additionalScenarios } from '../../utils/data/scenarios';

const presetCount = primaryScenarios.length + additionalScenarios.length;

const STEPS = [
  {
    icon: <ViewListOutlinedIcon />,
    title: 'Choose a preset or start from scratch',
    body: `Load one of ${presetCount} presets, from the standard 30-year purchase to a foreclosure in year 5, or build a custom scenario.`,
  },
  {
    icon: <TuneOutlinedIcon />,
    title: 'Adjust the assumptions',
    body: 'Change the home price, land and builder costs, financing, appreciation and how it is shared. Turn on optional features such as an early sale or a cash-out refinance.',
  },
  {
    icon: <InsightsOutlinedIcon />,
    title: 'Read the results and compare',
    body: "Review each party's capital, profit and annualized return, explore the charts, then add presets alongside to compare.",
  },
];

const GAP = 24; // px between step columns (desktop)
const MARKER = 48; // px marker diameter

// "How to use it": three numbered steps joined by a progress line that draws
// in as the steps scroll into view (horizontal on desktop, vertical on
// mobile), then the final call to action.
function HowToUse({ onSkipToAssumptions, onBrowsePresets }) {
  const stepDelay = (i) => `${i * motion.sequence * 1.5}ms`;
  return (
    <Box component="section" aria-labelledby="how-to-use-title" sx={{ pt: 7 }}>
      <Container>
        <SectionHeading
          eyebrow="How to use it"
          title={<span id="how-to-use-title">Three steps from assumptions to answers</span>}
        />

        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            columnGap: `${GAP}px`,
            rowGap: 3,
          }}
        >
          {/* Progress line (desktop): a hairline track and a fill that draws in. */}
          <Box
            aria-hidden
            sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: MARKER / 2 - 1, left: MARKER / 2, width: `calc((100% + ${GAP}px) * 2 / 3)`, height: 2, bgcolor: 'divider' }}
          />
          <Reveal
            aria-hidden
            className="motion-draw-x"
            style={{ '--motion-delay': '0ms', animationDuration: `${motion.duration.draw * 1.5}ms` }}
            sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: MARKER / 2 - 1, left: MARKER / 2, width: `calc((100% + ${GAP}px) * 2 / 3)`, height: 2, bgcolor: 'brand.primaryText' }}
          />

          {STEPS.map((step, i) => (
            <Box component="li" key={step.title} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: `${MARKER}px minmax(0, 1fr)`, md: '1fr' }, columnGap: 2, alignItems: 'start', alignContent: 'start' }}>
              {/* Vertical progress segment to the next step (mobile). */}
              {i < STEPS.length - 1 && (
                <>
                  <Box aria-hidden sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', left: MARKER / 2 - 1, top: MARKER, bottom: -24, width: 2, bgcolor: 'divider' }} />
                  <Reveal
                    aria-hidden
                    className="motion-draw-y"
                    style={{ '--motion-delay': stepDelay(i) }}
                    sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', left: MARKER / 2 - 1, top: MARKER, bottom: -24, width: 2, bgcolor: 'brand.primaryText' }}
                  />
                </>
              )}
              <Reveal
                aria-hidden
                style={{ '--motion-delay': stepDelay(i) }}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: MARKER,
                  height: MARKER,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'brand.primaryText',
                  color: 'brand.primaryText',
                  '& svg': { fontSize: 22 },
                }}
              >
                {step.icon}
              </Reveal>
              <Reveal style={{ '--motion-delay': stepDelay(i) }} sx={{ mt: { md: 2 }, pr: { md: 2 } }}>
                <Typography variant="overline" component="p" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  Step {i + 1}
                </Typography>
                <Typography variant="h5" component="h3" sx={{ mt: 0.25 }}>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{step.body}</Typography>
              </Reveal>
            </Box>
          ))}
        </Box>

        <Reveal index={2} sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          <Button variant="contained" size="large" onClick={onSkipToAssumptions} data-testid="howto-custom-button">
            Build custom scenario
          </Button>
          <Button variant="outlined" size="large" onClick={onBrowsePresets}>
            Browse presets
          </Button>
        </Reveal>
      </Container>
    </Box>
  );
}

export default HowToUse;
