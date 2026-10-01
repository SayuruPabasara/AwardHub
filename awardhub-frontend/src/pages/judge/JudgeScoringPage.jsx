import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sliders, Save, ArrowLeft, CheckCircle, Award, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import { evaluationApi } from '../../api/evaluation';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import JudgeScoringChart from '../../components/charts/JudgeScoringChart';

export default function JudgeScoringPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const nominationId = searchParams.get('nominationId') || '1';

  const [saving, setSaving] = useState(false);
  const [rubricScores, setRubricScores] = useState({
    innovation: 85,
    impact: 90,
    technicalFeasibility: 80,
    marketReadiness: 75,
    presentationQuality: 88,
  });
  const [comments, setComments] = useState('');

  const criteriaList = [
    { key: 'innovation', label: 'Technical & Creative Innovation', weight: '25%', max: 100 },
    { key: 'impact', label: 'Quantifiable Social / Economic Impact', weight: '25%', max: 100 },
    { key: 'technicalFeasibility', label: 'Engineering Feasibility & Architecture', weight: '20%', max: 100 },
    { key: 'marketReadiness', label: 'Scalability & Market Readiness', weight: '15%', max: 100 },
    { key: 'presentationQuality', label: 'Dossier Evidence & Clarity', weight: '15%', max: 100 },
  ];

  const handleScoreChange = (key, val) => {
    setRubricScores({ ...rubricScores, [key]: Number(val) });
  };

  const calculateWeightedTotal = () => {
    const total =
      rubricScores.innovation * 0.25 +
      rubricScores.impact * 0.25 +
      rubricScores.technicalFeasibility * 0.20 +
      rubricScores.marketReadiness * 0.15 +
      rubricScores.presentationQuality * 0.15;
    return total.toFixed(1);
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const judgeId = user?.id || 1;
      await evaluationApi.saveOne(nominationId, judgeId, {
        totalScore: Number(calculateWeightedTotal()),
        scores: rubricScores,
        comments,
      });
      toast.success('Evaluation grade locked and saved!');
      navigate('/judge/worklist');
    } catch (err) {
      toast.error(err.message || 'Saved locally (mock mode)');
      navigate('/judge/worklist');
    } finally {
      setSaving(false);
    }
  };

  const radarData = [
    { criterion: 'Innovation', score: rubricScores.innovation },
    { criterion: 'Impact', score: rubricScores.impact },
    { criterion: 'Feasibility', score: rubricScores.technicalFeasibility },
    { criterion: 'Readiness', score: rubricScores.marketReadiness },
    { criterion: 'Evidence', score: rubricScores.presentationQuality },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/judge/worklist')}>
          Back to Worklist
        </Button>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Evaluation Rubric Scoring
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
            Grading Nomination Dossier Ref #{nominationId}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Scoring Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Multi-Criteria Grading Sliders">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {criteriaList.map((crit) => (
                <div key={crit.key}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{crit.label}</span>
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        (Weight: {crit.weight})
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: 'var(--accent-primary)',
                        fontSize: '1rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {rubricScores[crit.key]} / 100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rubricScores[crit.key]}
                    onChange={(e) => handleScoreChange(crit.key, e.target.value)}
                    style={{
                      width: '100%',
                      accentColor: 'var(--accent-primary)',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Evaluator Qualitative Comments & Recommendations">
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide constructive feedback highlighting standout strengths, verifiable benchmarks, and areas for improvement..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </Card>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="secondary" onClick={() => navigate('/judge/worklist')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={Save}
              loading={saving}
              onClick={handleSaveEvaluation}
            >
              Submit Evaluation Score
            </Button>
          </div>
        </div>

        {/* Real-time Radar & Aggregate Total */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Weighted Score Total">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 0',
              }}
            >
              <span
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {calculateWeightedTotal()}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Normalized Composite Grade / 100
              </span>
            </div>
          </Card>

          <Card title="Criteria Radar Profile">
            <JudgeScoringChart data={radarData} />
          </Card>
        </div>
      </div>
    </div>
  );
}
