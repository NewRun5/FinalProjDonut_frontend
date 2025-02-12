import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import './leftPanel.css';

export default function LeftContent() {
  const markdownData = `
## 특수 상대성 이론: 에너지-질량 관계 (E=mc²)

특수 상대성 이론에서 가장 유명한 공식인 **E=mc²**는 질량과 에너지가 서로 변환 가능하다는 놀라운 사실을 나타냅니다. 이 식은 물리학과 우주를 이해하는 데 중요한 개념 중 하나로, 현대 물리학의 기초를 제공합니다. 여기서 *E*는 에너지, *m*은 질량, *c*는 빛의 속도입니다.

### 1. 빛의 속도 (c)
E=mc² 공식에서 빛의 속도는 매우 중요한 역할을 합니다. 빛의 속도는 약 **299,792,458 m/s**로, 우주에서 측정 가능한 가장 빠른 속도입니다. 빛의 속도는 우주에서 절대적인 상수로 여겨지며, 이 속도에 도달하는 물체는 더 이상 가속할 수 없다고 설명됩니다.

### 2. 질량과 에너지의 상호 관계
**질량(m)**: 물질이 가지는 고유한 성질로, 질량은 물체의 '양'을 나타내며 중력을 유발합니다. 특수 상대성 이론에서는 이 질량이 단순한 물리적 성질이 아닌, 에너지로 변환될 수 있는 성질임을 설명합니다.  
**에너지(E)**: 물체가 가지는 운동, 위치, 상태 등의 변화와 관련된 힘을 설명하는 개념입니다. 에너지는 운동 에너지, 위치 에너지 등 다양한 형태로 존재하지만, 특수 상대성 이론에서는 질량 자체가 에너지의 한 형태로 해석됩니다.

### 3. 질량-에너지 변환
특수 상대성 이론에 따르면, 질량을 가진 모든 물체는 본질적으로 에너지를 가지고 있습니다. 이때, 작은 질량도 엄청난 양의 에너지를 가지고 있다는 것이 E=mc²의 중요한 메시지입니다. 예를 들어, 1kg의 질량을 에너지로 변환하면 약 **9×10¹⁶줄(J)**의 에너지가 됩니다. 이는 대규모 폭발 에너지에 해당하는 엄청난 양입니다.

### 4. 실생활에서의 응용
이 식은 핵 반응에서 가장 대표적으로 나타납니다. 핵분열이나 핵융합 반응에서 작은 질량 차이가 엄청난 에너지 방출을 야기하며, 이는 원자력 발전이나 태양의 에너지원과 같은 현상을 설명하는 데 필수적입니다.

### 5. 상대론적 질량 증가
특수 상대성 이론에서 물체가 빛에 가까운 속도로 이동할 때 질량이 증가하게 됩니다. 이 현상을 **상대론적 질량 증가**라고 하며, 이는 물체가 빛의 속도에 가까워질수록 더 많은 에너지를 필요로 하게 된다는 것을 의미합니다.
`;

  return (
    <div className="left-content">
      <ReactMarkdown 
        children={markdownData} 
        rehypePlugins={[rehypeRaw]} 
        remarkPlugins={[remarkGfm]} 
      />
    </div>
  );
}

