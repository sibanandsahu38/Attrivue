/* ===== CONFIG ===== */
const APP_TITLE='Attrivue';
const APP_SUBTITLE='Attrition Predictor';
const PREFIX='attritionPredictor.v1.';
const SCHEMA_VERSION=1;
const PAGE_SIZE=25;
const UNDO_MS=10000;
const DEBOUNCE_MS=200;
const MAX_CSV_ROWS=20000;
const REASON_THRESHOLD=0.12;
const HELP_THRESHOLD=0.01;
const SELF_TEST_TOLERANCE=0.003;
const LOG_LIMIT=100;
const SAMPLE_SIZE=25;
const HISTOGRAM_BINS=10;
const TOP_LIST=3;
const TOP_DETAIL=4;
const REPLACEMENT_COST_DEFAULT=10000;
const WARNING_TEXT='Scores are probabilities, not facts. They can be wrong. Never use them to pressure, punish or dismiss anyone. Use them to find people who need support and to improve working conditions.';
const CAUSE_TEXT='These are patterns in the training data, not proof of cause. Pilot changes on a small group first.';
const MODEL_TRAINED_ON={
 ibm:'1,470 fictional employees from the classic IBM HR Analytics attrition dataset.',
 atlas:'1,470 synthetic employees generated for a technology company lab.',
 industry:'74,498 synthetic employees from a broad cross-industry survey.'
};
const isMac=/Mac|iPhone|iPad|iPod/.test(navigator.platform||navigator.userAgent);
