var WORDS = [ ['Yo',['I',0]],
              ['tengo', ['am',-1], ['have',-5]],
              ['hambre',['hungry',-2], ['hunger',-3]],
            ];

var BIGRAM = {
  '&lt;s&gt;': { '&lt;/s&gt;': -100, 'I': -0.996725, 'have': -3.560121, 'am': -4.5385327, 'hungry': -100, 'hunger': -4.9191365},
  'I': { '&lt;/s&gt;': -3.6827643, 'I': -100, 'have': -1.3471704, 'am': -1.5175364, 'hungry': -100, 'hunger': -100},
  'am': { '&lt;/s&gt;': -100, 'I': -1.7375976, 'have': -2.8604612, 'am': -100, 'hungry': -100, 'hunger': -100},
  'have': { '&lt;/s&gt;': -100, 'I': -3.1035352, 'have': -100, 'am': -100, 'hungry': -100, 'hunger': -100},
  'hunger': { '&lt;/s&gt;': -2.0071316, 'I': -100, 'have': -2.890773, 'am': -100, 'hungry': -100, 'hunger': -100},
  'hungry': { '&lt;/s&gt;': -100, 'I': -2.6267502, 'have': -100, 'am': -100, 'hungry': -100, 'hunger': -100},
};
