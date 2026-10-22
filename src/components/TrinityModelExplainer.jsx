import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Collapse,
} from '@mui/material';
import {
  ExpandMoreOutlined as ExpandMoreIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  PieChartOutlineOutlined as PieChartOutlineOutlinedIcon,
  AccountBalanceOutlined as AccountBalanceOutlinedIcon,
} from '@mui/icons-material';
import FaqSection from './explainer/FaqSection';
import SectionHeading from './common/SectionHeading';
import Reveal from './common/Reveal';
import { motion } from '../utils/motion';

function TrinityModelExplainer() {
  const [showFAQ, setShowFAQ] = useState(false);

  const handleToggleFAQ = () => {
    setShowFAQ(!showFAQ);
  };

  const explainerColumns = [
    {
      icon: <TrendingUpOutlinedIcon />,
      title: "Annualized return",
      description: "The annualized return each party earns over the hold period, calculated from total gain (monthly cash timing is not modelled). For homeowners, it measures equity growth against the down payment, with mortgage payments treated as housing cost. For DR Horton and Berkshire, it is based on appreciation share and interest income against upfront capital; when they fund the mortgage (interest income on), it is a cash-flow IRR that counts the loan only while it is outstanding.",
    },
    {
      icon: <PieChartOutlineOutlinedIcon />,
      title: "Shared appreciation",
      description: "A portion of the property's appreciation (typically 25%) is shared between the institutional partners. The homeowner retains the majority share (typically 75%), which keeps all parties aligned over the long term.",
    },
    {
      icon: <AccountBalanceOutlinedIcon />,
      title: "Mortgage structure",
      description: "Choosing interest-only or principal + interest payments changes how quickly the homeowner builds equity, but not the appreciation split. The model works with either financing structure.",
    }
  ];

  return (
    <Box component="section" aria-labelledby="explainer-title" sx={{ mt: 7, py: 7, bgcolor: 'brand.surfaceMuted', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title={<span id="explainer-title">Understanding the Trinity model</span>}
          description="An approach to housing finance that aligns institutional capital, construction expertise and homeowner equity in one partnership."
        />

        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }}>
          {explainerColumns.map((column, index) => (
            <Reveal component="li" index={index} key={column.title} className="motion-lift" sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '6px', p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ color: 'brand.primaryText', display: 'flex', '& svg': { fontSize: 22 } }} aria-hidden>{column.icon}</Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{String(index + 1).padStart(2, '0')}</Typography>
              </Box>
              <Typography variant="h5" component="h3" sx={{ mb: 1 }}>{column.title}</Typography>
              <Typography variant="body2" color="text.secondary">{column.description}</Typography>
            </Reveal>
          ))}
        </Box>

        <Reveal sx={{ mt: 7, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: { xs: 3, md: 6 }, alignItems: 'start' }}>
          <Box>
            <Typography variant="h3" component="h2">Frequently asked questions</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Ownership, exits, valuation, default and tax treatment under the Trinity model.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleToggleFAQ}
              data-testid="faq-toggle"
              aria-expanded={showFAQ}
              aria-controls="faq-list"
              endIcon={<ExpandMoreIcon sx={{ transform: showFAQ ? 'rotate(180deg)' : 'none', transition: `transform ${motion.duration.base}ms ${motion.easing.out}` }} />}
            >
              {showFAQ ? 'Hide questions' : 'Show questions'}
            </Button>
          </Box>
          <Collapse in={showFAQ} id="faq-list">
            <FaqSection showTitle={false} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Have a question we do not cover? Model the specific case in the simulator to see how each assumption changes the outcome for every party.
            </Typography>
          </Collapse>
        </Reveal>
      </Container>
    </Box>
  );
}

export default TrinityModelExplainer;