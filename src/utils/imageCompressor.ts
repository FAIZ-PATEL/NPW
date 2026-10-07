/**
 * Resizes and compresses an image to fit nicely within Firestore document limits (< 150KB)
 * while maintaining crisp resolution for machine nameplates and serial numbers.
 */
export async function compressImage(fileOrDataUrl: File | string, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

// Preset workshop photos for instant 1-click testing
export const SAMPLE_WORKSHOP_PHOTOS = [
  {
    id: 'welder_arc200',
    title: 'Inverter ARC 200 Welder',
    category: 'Welding Machine',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'welder_tig',
    title: 'TIG 250 Welding Inverter',
    category: 'TIG Welder',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tool_grinder',
    title: 'Angle Grinder Heavy Duty',
    category: 'Power Tool',
    url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tool_hammer',
    title: 'Rotary Hammer Drill',
    category: 'Power Tool',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pcb_fault',
    title: 'Burnt IGBT / Circuit Board',
    category: 'Internal Fault',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
  },
];
