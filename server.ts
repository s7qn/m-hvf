import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // AI Quiz Generation Endpoint
  app.post('/api/gemini/generate-quiz', async (req, res) => {
    try {
      const {
        subjectName,
        stage,
        lectureTitle,
        description,
        summaryPoints,
        keyFormulas,
        hasMathProblems = false,
        count = 5,
      } = req.body || {};

      const formulasStr = Array.isArray(keyFormulas) && keyFormulas.length > 0
        ? keyFormulas.join('\n- ')
        : 'لا توجد قوانين محددة يدوياً، قم باستخراج أو ابتكار مسائل تحكم هندسية مناسبة لموضوع المحاضرة.';

      const summaryStr = Array.isArray(summaryPoints) && summaryPoints.length > 0
        ? summaryPoints.join('\n- ')
        : (description || lectureTitle || 'مفاهيم هندسة السيطرة والأتمتة');

      const systemInstruction = `أنت أستاذ جامعي ومصمم اختبارات أكاديمية متخصص في هندسة تقنيات السيطرة والأتمتة (Control and Automation Engineering).
مهمتك توليد أسئلة اختبار دقيقة ومتزامنة تماماً مع موضوع المحاضرة المعطاة لطلاب المرحلة الدراسية ${stage || 1}.
القواعد الصارمة:
1. الأسئلة يجب أن تكون متوافقة بنسبة 100% مع مادة المحاضرة (${lectureTitle || 'المحاضرة'} - مادة: ${subjectName || 'السيطرة والأتمتة'}).
2. ${hasMathProblems ? 'شرط أساسي وجوهري: بما أن المحاضرة تحتوي على مسائل رياضية (hasMathProblems = true)، يجب أن يتضمن الاختبار مسائل حسابية ورياضية هندسية فعلية (Engineering Math & Control Calculations) تتضمن أرقاماً، حسابات، معادلات، ودوال تحويل أو تعويض مباشر مع خطوات حل رقمية واضحة في التفسير.' : 'اجعل الأسئلة تجمع بين الفهم الهندسي التحليلي والتطبيقات الهندسية العملية.'}
3. كل سؤال يجب أن يحتوي على:
- نص السؤال بالعربية (questionAr) وبالإنجليزية (questionEn).
- 4 خيارات بالعربية (optionsAr) و4 خيارات بالإنجليزية (optionsEn).
- رقم الخيار الصحيح (correctIndex) بين 0 و 3.
- تفسير رياضي وهندسي دقيق لخطوات الحل (explanationAr و explanationEn).
- المعادلة أو القانون الرياضي المستخدم إن وُجد (codeOrFormula).`;

      const prompt = `المادة الدراسية: ${subjectName || 'هندسة السيطرة والأتمتة'}
المرحلة الأكاديمية: ${stage || 1}
عنوان المحاضرة: ${lectureTitle || 'محاضرة هندسية'}
وصف المحاضرة: ${description || ''}
النقاط الأساسية للمحاضرة:
- ${summaryStr}
القوانين والمعادلات في الملزمة:
- ${formulasStr}
هل تحتوي على مسائل رياضية؟ ${hasMathProblems ? 'نعم، يجب إدراج مسائل رياضية وحسابات هندسية رقمية بأرقام دقيقة' : 'لا'}
المطلوب: توليد ${count} أسئلة اختبار اختيار من متعدد (MCQ) احترافية وعالية المستوى.`;

      const ai = getGeminiClient();

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.4,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        questionAr: { type: Type.STRING },
                        questionEn: { type: Type.STRING },
                        optionsAr: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        optionsEn: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        correctIndex: { type: Type.INTEGER },
                        explanationAr: { type: Type.STRING },
                        explanationEn: { type: Type.STRING },
                        codeOrFormula: { type: Type.STRING },
                      },
                      required: ['questionAr', 'optionsAr', 'correctIndex', 'explanationAr'],
                    },
                  },
                },
                required: ['questions'],
              },
            },
          });

          const rawText = response.text || '';
          const parsed = JSON.parse(rawText);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return res.json({
              success: true,
              source: 'gemini',
              questions: parsed.questions,
            });
          }
        } catch (apiErr) {
          console.warn('Gemini API call failed, falling back to smart engineering generator:', apiErr);
        }
      }

      // Smart Fallback tailored specifically for Control & Automation Engineering
      const fallbackQuestions = generateSmartFallbackQuestions(
        subjectName || 'هندسة السيطرة والأتمتة',
        lectureTitle || 'المحاضرة',
        stage || 1,
        hasMathProblems,
        keyFormulas
      );

      return res.json({
        success: true,
        source: 'smart_fallback',
        questions: fallbackQuestions,
      });
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to generate quiz questions',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateSmartFallbackQuestions(
  subject: string,
  title: string,
  stage: number,
  hasMath: boolean,
  formulas?: string[]
) {
  const isMathOrControl = subject.includes('رياضيات') || subject.includes('سيطرة') || subject.includes('قياسات') || hasMath;

  const questions = [];

  if (hasMath || isMathOrControl) {
    questions.push({
      questionAr: `مسألة حسابية: في منظومة سيطرة من الرتبة الثانية بدالة تحويل G(s) = 25 / (s² + 6s + 25)، ما هو التردد الطبيعي (ωn) ونسبة التخميد (ζ)؟`,
      questionEn: `Calculation Problem: For a 2nd-order control system with G(s) = 25 / (s² + 6s + 25), what are the natural frequency (ωn) and damping ratio (ζ)?`,
      optionsAr: [
        'ωn = 5 rad/s و ζ = 0.6 (نظام تحت التخميد Underdamped)',
        'ωn = 25 rad/s و ζ = 3.0 (نظام فوق التخميد Overdamped)',
        'ωn = 5 rad/s و ζ = 1.0 (تخميد حرج Critically Damped)',
        'ωn = 6 rad/s و ζ = 0.5 (نظام غير مستقر Unstable)'
      ],
      optionsEn: [
        'ωn = 5 rad/s and ζ = 0.6 (Underdamped)',
        'ωn = 25 rad/s and ζ = 3.0 (Overdamped)',
        'ωn = 5 rad/s and ζ = 1.0 (Critically Damped)',
        'ωn = 6 rad/s and ζ = 0.5 (Unstable)'
      ],
      correctIndex: 0,
      codeOrFormula: 's² + 2ζωn s + ωn² = s² + 6s + 25 => ωn² = 25 => ωn = 5 rad/s, 2ζ(5) = 6 => ζ = 0.6',
      explanationAr: 'بمقارنة المعادلة المميزة بالصيغة القياسية: s² + 2ζωn s + ωn² = 0، نجد أن ωn² = 25 أي ωn = 5 rad/s. ومعامل s هو 2ζωn = 6، بالتعويض: 10ζ = 6 إذن ζ = 0.6، وبما أن 0 < ζ < 1 فإن النظام تحت التخميد (Underdamped).',
      explanationEn: 'Comparing with standard form s² + 2ζωn s + ωn² = 0: ωn = sqrt(25) = 5 rad/s. Then 2ζωn = 6 => 10ζ = 6 => ζ = 0.6. Since 0 < ζ < 1, the system is underdamped.'
    });

    questions.push({
      questionAr: `مسألة رياضية: إذا كانت إشارة الدخل لدائرة خطوة واحدة R(s) = 1/s، ودالة المسار المفتوح G(s) = 10 / (s + 2)، فما قيمة الخطأ في الحالة المستقرة (Steady-State Error ess)؟`,
      questionEn: `Math Problem: If input is a unit step R(s) = 1/s and open loop G(s) = 10 / (s + 2), what is the steady-state error (ess)?`,
      optionsAr: [
        'ess = 1 / (1 + Kp) = 1 / 6 ≈ 0.167',
        'ess = 0 (خطأ منعدم تماماً)',
        'ess = 5.0 (خطأ متراكم)',
        'ess = 1 / 10 = 0.1'
      ],
      optionsEn: [
        'ess = 1 / (1 + Kp) = 1 / 6 ≈ 0.167',
        'ess = 0 (Zero error)',
        'ess = 5.0 (Accumulated error)',
        'ess = 1 / 10 = 0.1'
      ],
      codeOrFormula: 'Kp = lim(s->0) G(s) = 10/2 = 5 => ess = 1 / (1 + Kp) = 1 / (1 + 5) = 1/6',
      explanationAr: 'لحساب ثابت الخطأ الموضعي: Kp = lim(s->0) G(s) = 10 / (0 + 2) = 5. الخطأ في الحالة المستقرة لإشارة خطوة هو: ess = 1 / (1 + Kp) = 1 / (1 + 5) = 1/6 ≈ 0.167.',
      explanationEn: 'Position error constant Kp = lim(s->0) 10/(s+2) = 5. For unit step: ess = 1 / (1 + Kp) = 1 / 6 ≈ 0.167.'
    });

    questions.push({
      questionAr: `حسابات هندسية: مكبر عمليات عاكس (Inverting Op-Amp) بمقاومة دخل Rin = 10 kΩ ومقاومة تغذية عكسية Rf = 100 kΩ. ما هو كسب الجهد (Voltage Gain Av) وجهد الخرج Vout عند دخل Vin = 0.5 V؟`,
      questionEn: `Engineering Calculation: Inverting Op-Amp with Rin = 10 kΩ and Rf = 100 kΩ. What is the voltage gain Av and output Vout for Vin = 0.5 V?`,
      optionsAr: [
        'Av = -10 و Vout = -5.0 V',
        'Av = +10 و Vout = +5.0 V',
        'Av = -0.1 و Vout = -0.05 V',
        'Av = -11 و Vout = -5.5 V'
      ],
      optionsEn: [
        'Av = -10 and Vout = -5.0 V',
        'Av = +10 and Vout = +5.0 V',
        'Av = -0.1 and Vout = -0.05 V',
        'Av = -11 and Vout = -5.5 V'
      ],
      codeOrFormula: 'Av = - (Rf / Rin) = - (100k / 10k) = -10 => Vout = Av * Vin = -10 * 0.5 = -5 V',
      explanationAr: 'كسب المكبر العاكس هو Av = -(Rf / Rin) = -(100/10) = -10. جهد الخرج = Av × Vin = -10 × 0.5 V = -5.0 V (مع انقلاب طور بمقدار 180 درجة).',
      explanationEn: 'Gain for inverting amplifier Av = -(Rf / Rin) = -10. Vout = -10 * 0.5 = -5.0 V with 180 degree phase shift.'
    });
  }

  questions.push({
    questionAr: `ما هو الغرض الرئيسي والجوهر التطبيقي لموضوع "${title}" ضمن منهج ${subject}؟`,
    questionEn: `What is the primary practical and theoretical purpose of "${title}" in ${subject}?`,
    optionsAr: [
      'فهم النمذجة الرياضية الدقيقة وضمان استقرارية الأداء الهندسي والتحكم الآلي',
      'إلغاء أجهزة الاستشعار والمحولات الصناعية في حلقة التحكم',
      'زيادة نسبة الخطأ التراكمي وتجاهل المتغيرات الفيزيائية',
      'استخدام مكونات بدون معايرة معتمدة مسبقاً'
    ],
    optionsEn: [
      'Understanding accurate mathematical modeling and ensuring stability in automated systems',
      'Eliminating feedback sensors in the control loop',
      'Increasing cumulative error and ignoring physical variables',
      'Using uncalibrated components arbitrarily'
    ],
    correctIndex: 0,
    explanationAr: 'الهدف الجوهري هو فهم النمذجة الرياضية والتحليل الهندسي الدقيق لضمان عمل منظومات السيطرة والأتمتة بأعلى معايير الاستقرار والكفاءة.',
    explanationEn: 'The core objective is rigorous mathematical modeling to ensure maximum stability and efficiency in automation.'
  });

  questions.push({
    questionAr: `في سياق التطبيقات العملية لمحاضرة "${title}"، كيف يؤثر ضبط البارامترات الهندسية على سلوك المنظومة؟`,
    questionEn: `In the practical application of "${title}", how does parameter tuning affect system response?`,
    optionsAr: [
      'يقلل زمن الاستقرار (Settling Time) ويحافظ على هامش الاستقرارية (Gain & Phase Margin)',
      'يؤدي حتماً إلى تذبذبات غير منتهية وخروج النظام عن السيطرة',
      'يجعل دالة التحويل غير معرفة رياضياً',
      'يعطل التغذية العكسية (Negative Feedback) بالكامل'
    ],
    optionsEn: [
      'Minimizes settling time and maintains healthy gain and phase margins',
      'Always causes unbounded oscillations and instability',
      'Renders the transfer function undefined mathematically',
      'Completely disables negative feedback'
    ],
    correctIndex: 0,
    explanationAr: 'الضبط الهندسي السليم للبارامترات يقلل زمن الاستقرار والخطأ في الحالة المستقرة مع ضمان هوامش أمان واستقرارية كافية (Gain & Phase Margins).',
    explanationEn: 'Proper parameter tuning minimizes settling time and steady-state error while maintaining adequate stability margins.'
  });

  return questions;
}

startServer();
