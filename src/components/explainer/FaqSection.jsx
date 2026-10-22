import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { ExpandMoreOutlined as ExpandMoreIcon } from '@mui/icons-material';
import { faqItems } from '../../utils/data/faq';

// The app's single FAQ, fed from utils/data/faq.js. Pass showTitle={false}
// when the parent already renders its own "Frequently Asked Questions" heading.
function FaqSection({ showTitle = true }) {
  return (
    <>
      {showTitle && (
        <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
          Frequently asked questions
        </Typography>
      )}
      {faqItems.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`faq-${index}-content`} id={`faq-${index}-header`}>
            <Typography variant="h6" component="h3" sx={{ transition: 'color 150ms ease-out' }}>
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

export default FaqSection;