import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CallMadeOutlined as PaysIcon,
  CallReceivedOutlined as ReceivesIcon,
  DragHandleOutlined as TotalIcon,
} from '@mui/icons-material';
import SectionHeading from '../common/SectionHeading';
import StakeholderLabel from '../common/StakeholderLabel';
import AnimatedNumber from '../common/AnimatedNumber';
import Note from '../common/Note';
import Reveal from '../common/Reveal';
import { motion } from '../../utils/motion';
import { EXAMPLE_LABEL, exampleInputs, exampleMetrics, formatCurrency, formatPercent } from './example';

// "How the program works": the three parties and the money between them at
// purchase, during the hold and at exit, with the Standard preset's figures.
// Desktop: swimlanes (one row per party, one column per phase) joined by
// connector lines that draw in. Mobile: phases stacked, one card per party.
// Phases reveal in sequence (motion.sequence) and amounts count up.

const LANES = [
  { key: 'homeowner', name: 'Homeowner', role: 'Buys and lives in the home' },
  { key: 'drHorton', name: 'DR Horton', role: 'Builder and partner' },
  { key: 'berkshire', name: 'Berkshire', role: 'Institutional partner' },
];

const DIRECTION = {
  out: { icon: PaysIcon, sr: 'Money out' },
  in: { icon: ReceivesIcon, sr: 'Money in' },
  total: { icon: TotalIcon, sr: 'Result' },
};

const buildPhases = () => {
  const m = exampleMetrics;
  const d = exampleInputs;
  const exit = m.effectiveSaleYear;
  const drSplit = d.interestSplitDrHorton;
  const brkSplit = d.interestSplitBerkshire;
  return [
    {
      key: 'purchase',
      label: 'At purchase',
      when: 'Year 0',
      summary: `Land (${formatCurrency(m.landValue)}) and builder costs (${formatCurrency(m.totalBuilderCost)}) make a ${formatCurrency(m.totalProjectCost)} project cost, split 50/50 between the partners.`,
      lanes: {
        homeowner: [
          { dir: 'out', label: 'Pays 10% down payment', value: m.downPayment },
          { dir: 'in', label: 'Borrows the mortgage from the partners', value: m.loanAmount },
        ],
        drHorton: [
          { dir: 'out', label: 'Pays 50% of the project cost', value: m.drHortonCostShare },
          { dir: 'out', label: `Funds ${formatPercent(drSplit)} of the mortgage`, value: m.drHortonLoanFunding },
        ],
        berkshire: [
          { dir: 'out', label: 'Pays 50% of the project cost', value: m.berkshireCostShare },
          { dir: 'out', label: `Funds ${formatPercent(brkSplit)} of the mortgage`, value: m.berkshireLoanFunding },
        ],
      },
    },
    {
      key: 'hold',
      label: 'During the hold',
      when: `Years 1–${exit}`,
      summary: 'The homeowner holds title, lives in the home and pays the mortgage. Interest and principal go to the partners in their interest split.',
      lanes: {
        homeowner: [
          { dir: 'out', label: 'Pays mortgage interest', value: m.totalInterestPaid },
          { dir: 'out', label: 'Repays principal', value: m.principalPaidDown },
        ],
        drHorton: [
          { dir: 'in', label: `Receives ${formatPercent(drSplit)} of the interest`, value: m.drHortonInterestIncome },
          { dir: 'in', label: 'Receives principal', value: m.principalPaidDown * (drSplit / 100) },
        ],
        berkshire: [
          { dir: 'in', label: `Receives ${formatPercent(brkSplit)} of the interest`, value: m.berkshireInterestIncome },
          { dir: 'in', label: 'Receives principal', value: m.principalPaidDown * (brkSplit / 100) },
        ],
      },
    },
    {
      key: 'exit',
      label: 'At exit',
      when: `Year ${exit}`,
      summary: `The home is valued at ${formatCurrency(m.futureValue)}. Any loan balance (${formatCurrency(m.remainingBalance)} here) is repaid and the ${formatCurrency(m.totalAppreciation)} of appreciation is split.`,
      lanes: {
        homeowner: [
          { dir: 'in', label: `Keeps ${formatPercent(m.homeownerAppreciationShare)} of the appreciation`, value: m.homeownerAppreciation },
          { dir: 'total', label: 'Equity at exit', value: m.homeownerEquity },
        ],
        drHorton: [
          { dir: 'in', label: 'Gets its cost share back', value: m.drHortonCostShare },
          { dir: 'in', label: `Receives ${formatPercent(m.drHortonAppreciationShare)} of the appreciation`, value: m.drHortonAppreciation },
          { dir: 'total', label: 'Profit: interest plus appreciation', value: m.drHortonTotalReturn },
        ],
        berkshire: [
          { dir: 'in', label: 'Gets its cost share back', value: m.berkshireCostShare },
          { dir: 'in', label: `Receives ${formatPercent(m.berkshireAppreciationShare)} of the appreciation`, value: m.berkshireAppreciation },
          { dir: 'total', label: 'Profit: interest plus appreciation', value: m.berkshireTotalReturn },
        ],
      },
    },
  ];
};

const PHASES = buildPhases();
const seq = (phase, extra = 0) => `${phase * motion.sequence + extra}ms`;

function FlowItem({ item, countDelay }) {
  const { icon: Icon, sr } = DIRECTION[item.dir];
  const isTotal = item.dir === 'total';
  return (
    <Box component="li" sx={{ display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr)', columnGap: 1, ...(isTotal && { pt: 1.25, mt: 0.25, borderTop: '1px solid', borderColor: 'divider' }) }}>
      <Icon aria-hidden sx={{ fontSize: 18, mt: '2px', color: 'text.secondary' }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          <Box component="span" sx={visuallyHidden}>{sr}: </Box>
          {item.label}
        </Typography>
        <Typography variant="subtitle2" component="p" sx={{ fontFamily: 'h6.fontFamily', fontSize: isTotal ? '1.125rem' : '1rem', fontVariantNumeric: 'tabular-nums', mt: 0.25 }}>
          <AnimatedNumber value={item.value} format={formatCurrency} delay={countDelay} />
        </Typography>
      </Box>
    </Box>
  );
}

// Pixel strings on purpose: in sx, width: 1 means 100% and m: -1 means -8px.
const visuallyHidden = { position: 'absolute', width: '1px', height: '1px', p: 0, m: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };

function ProgramFlow() {
  const theme = useTheme();
  const laneColor = (key) => theme.palette.chart[key];

  return (
    <Box
      component="section"
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      sx={{ py: 7, bgcolor: 'brand.surfaceMuted', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}
    >
      <Container>
        <SectionHeading
          eyebrow="How the program works"
          title={<span id="how-it-works-title">Who puts in what, and when it comes back</span>}
          description="DR Horton and Berkshire split the project cost (land and builder costs) and, with interest income on, fund the mortgage. The homeowner puts 10% down, lives in the home and keeps most of the appreciation at exit."
        />
        <Typography variant="overline" component="p" color="text.secondary" sx={{ mb: 0.5 }}>
          {EXAMPLE_LABEL}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          A {formatCurrency(exampleMetrics.homePurchasePrice)} home, {formatPercent(exampleInputs.annualAppreciationRate)} annual appreciation, a {exampleInputs.loanTerm}-year principal and interest mortgage at {formatPercent(exampleInputs.interestRate)}, held for {exampleMetrics.effectiveSaleYear} years. Amounts are totals for each phase.
        </Typography>
        {/* Key for the row icons (screen readers get the same words inline). */}
        <Box aria-hidden sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, mt: 1.5, mb: 4 }}>
          {[['out', 'Money out'], ['in', 'Money in'], ['total', 'Result at exit']].map(([dir, text]) => {
            const Icon = DIRECTION[dir].icon;
            return (
              <Typography key={dir} variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <Icon sx={{ fontSize: 16 }} /> {text}
              </Typography>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '148px repeat(3, minmax(0, 1fr))', lg: '180px repeat(3, minmax(0, 1fr))' },
            columnGap: { md: 3 },
            rowGap: { xs: 1.5, md: 2 },
            alignItems: 'stretch',
          }}
        >
          {/* Lane connectors (desktop): one per party, behind the cells. */}
          {LANES.map((lane, l) => (
            <Reveal
              key={`line-${lane.key}`}
              aria-hidden
              className="motion-draw-x"
              style={{ '--motion-delay': seq(0, 120 + l * motion.stagger) }}
              sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '2 / 5', gridRow: l + 2, alignSelf: 'center', height: 2, bgcolor: alpha(laneColor(lane.key), 0.7) }}
            />
          ))}
          {/* Lane labels (desktop). */}
          {LANES.map((lane, l) => (
            <Reveal
              key={`label-${lane.key}`}
              index={l}
              sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', gridColumn: 1, gridRow: l + 2, pr: 1 }}
            >
              <Typography variant="subtitle2" component="p">
                <StakeholderLabel stakeholder={lane.key}>{lane.name}</StakeholderLabel>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ pl: 2.25 }}>{lane.role}</Typography>
            </Reveal>
          ))}

          {PHASES.map((phase, p) => (
            <React.Fragment key={phase.key}>
              <Reveal
                component="header"
                style={{ '--motion-delay': seq(p) }}
                sx={{ gridColumn: { md: p + 2 }, gridRow: { md: 1 }, mt: { xs: p === 0 ? 0 : 3, md: 0 }, mb: { md: 1 } }}
              >
                {/* Phase marker; on desktop a timeline segment draws to the next one. */}
                <Box aria-hidden sx={{ position: 'relative', height: 16, mb: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid', borderColor: 'brand.primaryText', bgcolor: p === PHASES.length - 1 ? 'brand.primaryText' : 'brand.surfaceMuted' }} />
                  {p < PHASES.length - 1 && (
                    <Reveal
                      className="motion-draw-x"
                      style={{ '--motion-delay': seq(p, 120) }}
                      sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: 7, left: 24, right: (t) => `-${t.spacing(3)}`, height: 2, bgcolor: 'brand.primaryText', opacity: 0.5 }}
                    />
                  )}
                </Box>
                <Typography variant="overline" component="p" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {String(p + 1).padStart(2, '0')} · {phase.when}
                </Typography>
                <Typography variant="h4" component="h3" sx={{ mt: 0.25 }}>{phase.label}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, textWrap: 'pretty' }}>{phase.summary}</Typography>
              </Reveal>

              {LANES.map((lane, l) => (
                <Reveal
                  key={`${phase.key}-${lane.key}`}
                  className="motion-lift"
                  style={{ '--motion-delay': seq(p, 80 + l * motion.stagger) }}
                  aria-label={`${phase.label}, ${lane.name}`}
                  role="group"
                  sx={{
                    gridColumn: { md: p + 2 },
                    gridRow: { md: l + 2 },
                    position: 'relative',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '3px solid',
                    borderLeftColor: laneColor(lane.key),
                    borderRadius: '6px',
                    p: 2,
                  }}
                >
                  <Typography variant="subtitle2" component="p" sx={{ display: { md: 'none' }, mb: 1.25 }}>
                    <StakeholderLabel stakeholder={lane.key}>{lane.name}</StakeholderLabel>
                  </Typography>
                  <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
                    {phase.lanes[lane.key].map((item) => (
                      <FlowItem key={item.label} item={item} countDelay={p * motion.sequence + 240} />
                    ))}
                  </Box>
                </Reveal>
              ))}
            </React.Fragment>
          ))}
        </Box>

        <Reveal sx={{ mt: 4, maxWidth: 880 }}>
          <Note title="With interest income off.">
            The partners do not fund the mortgage and receive no interest or principal; their return comes from their appreciation share and any optional features you turn on. The 50/50 cost share and the 10% down payment are fixed in the model. The appreciation split (75 / 12.5 / 12.5 by default) and the interest split can be changed in the simulator.
          </Note>
        </Reveal>
      </Container>
    </Box>
  );
}

export default ProgramFlow;
