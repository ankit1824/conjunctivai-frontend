import React from 'react'
import { ExternalLink } from 'lucide-react'

const MODELS = [
  { name: 'XGBoost',      family: 'Gradient Boosting', color: '#F6C90E', desc: 'Sequentially builds trees, each correcting errors of the previous. Strongest on tabular colour features.' },
  { name: 'Random Forest', family: 'Bagged Trees',      color: '#FF6B6B', desc: 'Trains many trees on random feature subsets, majority votes. Gives feature importance for explainability.' },
  { name: 'SVM (RBF)',    family: 'Margin-based',       color: '#4EA8DE', desc: 'Finds the maximum-margin boundary in a high-dimensional kernel space. Needs feature scaling.' },
  { name: 'KNN',          family: 'Instance-based',     color: '#56CFB2', desc: 'Classifies by the majority label among the k nearest training examples. Fully explainable predictions.' },
  { name: 'Gaussian NB',  family: 'Probabilistic',      color: '#C77DFF', desc: 'Fast, assumes independence between features. Acts as an honest low-complexity baseline.' },
]

const FEATURES = [
  { name: 'Colour statistics', dims: 24, detail: 'Mean and std per channel in RGB, HSV, LAB and YCbCr colour spaces' },
  { name: 'Redness ratios',    dims: 2,  detail: 'R/G and R/(R+G+B) — directly mirrors the haemoglobin-pallor signal' },
  { name: 'GLCM texture',      dims: 4,  detail: 'Contrast, homogeneity, energy, correlation at 64-level quantisation' },
  { name: 'LBP histogram',     dims: 10, detail: 'Local binary pattern distribution on grayscale foreground pixels' },
]

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">About ConjunctivAI</h1>
        <p className="text-muted text-sm leading-relaxed">
          ConjunctivAI detects anemia from palpebral conjunctiva photographs using five classical machine-learning classifiers, each trained on a compact 40-dimensional feature vector extracted from foreground (non-black) pixels. It extends and directly contrasts the CNN-based approach of Jayanth & Aneetha (2025), which used the same dataset but suffered from train-test leakage.
        </p>
      </div>

      {/* Clinical basis */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Clinical Basis</div>
        <div className="card p-5 space-y-3 text-sm text-muted leading-relaxed">
          <p>
            The palpebral conjunctiva — the inner lining of the lower eyelid — is one of the most diagnostically accessible sites for detecting pallor caused by anaemia. In healthy individuals, haemoglobin in the capillaries beneath this membrane gives it a characteristic red colouration.
          </p>
          <p>
            When haemoglobin levels drop, the membrane loses redness and becomes pale. This manifests as a measurable decrease in the R/G ratio: our dataset confirms non-anemic conjunctiva has a mean R/G ratio of 1.667 versus 1.561 for anemic images — a statistically detectable signal that our colour features capture directly.
          </p>
        </div>
      </div>

      {/* Dataset */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Dataset</div>
        <div className="card p-5 text-sm text-muted space-y-2">
          <div className="grid grid-cols-2 gap-y-2 gap-x-6">
            {[
              ['Source', 'Kaggle — cleaned_augmented_anemia_dataset'],
              ['Total images', '10,256 PNG at 224×224'],
              ['Unique patient IDs', '526 (307 anemic, 219 non-anemic)'],
              ['Augmentations', 'Up to 23× per source image (rotation, flip, zoom, shift)'],
              ['Split strategy', 'Grouped by source ID — 70/15/15 train/val/test'],
              ['Leakage', 'Zero — test set contains only unseen patient IDs'],
            ].map(([k, v]) => (
              <React.Fragment key={k}>
                <span className="text-dim">{k}</span>
                <span className="text-white">{v}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Feature Vector — 40 Dimensions</div>
        <p className="text-sm text-muted mb-4">Features are computed exclusively on non-black (foreground) pixels. Images have ~79% black background — without the mask, every statistic would be diluted.</p>
        <div className="space-y-2">
          {FEATURES.map(f => (
            <div key={f.name} className="card p-4 flex items-start gap-4">
              <span className="font-mono text-xs bg-surface2 text-accent px-2 py-1 rounded flex-shrink-0 mt-0.5">{f.dims} dim</span>
              <div>
                <div className="text-sm font-medium text-white">{f.name}</div>
                <div className="text-xs text-muted mt-0.5">{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">The 5 Models</div>
        <div className="space-y-2">
          {MODELS.map(m => (
            <div key={m.name} className="card p-4 flex items-start gap-4" style={{ borderLeft: `3px solid ${m.color}` }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{m.name}</span>
                  <span className="text-xs text-dim">{m.family}</span>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">Limitations</div>
        <div className="card p-5 space-y-2 text-sm text-muted leading-relaxed">
          <ul className="space-y-2 list-disc list-inside">
            <li>The app accepts <strong className="text-white">pre-segmented conjunctiva crops only</strong>. Automatic ROI extraction from a full eye photograph is the paper's stated future work and is out of scope here.</li>
            <li>The dataset contains augmented images from a limited number of source patients (~526). Real-world deployment requires a larger, more diverse cohort.</li>
            <li>Lighting conditions and camera characteristics affect colour statistics. Results may vary on images captured outside the dataset's conditions.</li>
            <li><strong className="text-white">Not a clinical tool.</strong> This is an academic demonstration and should not replace laboratory or physician diagnosis.</li>
          </ul>
        </div>
      </div>

      {/* References */}
      <div>
        <div className="text-xs text-dim font-semibold uppercase tracking-wider mb-4">References</div>
        <div className="space-y-2 text-sm">
          {[
            ['Jayanth & Aneetha (2025)', 'Anaemia detection from conjunctiva images using deep learning. IJARM Vol. 3 Issue 2.', 'https://doi.org/10.5281/zenodo.15574495'],
            ['Tamir et al. (2017)', 'Detection of anemia from anterior conjunctiva by image processing and thresholding. IEEE R10-HTC.', ''],
            ['Ravi et al. (2024)', 'Anemia estimation using eye conjunctiva image: CNN vs EfficientNet. ICCPCT 2024.', ''],
          ].map(([title, desc, url]) => (
            <div key={title} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="text-xs text-muted mt-0.5">{desc}</div>
                </div>
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent flex-shrink-0 mt-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
