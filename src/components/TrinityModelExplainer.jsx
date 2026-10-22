import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Collapse,
} from '@mui/material';
import { ExpandMoreOutlined as ExpandMoreIcon } from '@mui/icons-material';
import FaqSection from './explainer/FaqSection';
import Reveal from './common/Reveal';
import { motion } from '../utils/motion';

function TrinityModelExplainer() {
  const [showFAQ, setShowFAQ] = useState(false);

  const handleToggleFAQ = () => {
    setShowFAQ(!showFAQ);
  };

  return (
    <Box component="section" aria-labelledby="faq-title" sx={{ py: 7 }}>
      <Container>
        <Reveal sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: { xs: 3, md: 6 }, alignItems: 'start' }}>
          <Box>
            <Typography variant="overline" component="p" color="text.secondary" sx={{ mb: 0.75 }}>FAQ</Typography>
            <Typography variant="h3" component="h2" id="faq-title">Frequently asked questions</Typography>
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