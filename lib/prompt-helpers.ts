import { CharacterData, ContextData } from './prompt-types';

export function generatePrompt(character: CharacterData | null, context: ContextData | null, segmentText: string): string {
  const name = character?.name || 'unknown';
  const age = character?.age?.toString() || 'unknown';
  const ethnicity = character?.ethnicity || '';
  const occupation = character?.occupation || '';
  const clothing = character?.clothing || 'unknown';
  const accessories = character?.accessories || 'with no accessories';
  const pose = character?.pose || 'standing';
  const eyes = character?.eyes || 'normal';
  const hair = character?.hair || 'normal';
  const environment = context?.environment || 'unknown';
  const location = context?.location || 'unknown';
  const season = context?.season || 'unknown';
  const time_of_day = context?.time_of_day || 'unknown';
  const weather = context?.weather || 'sunny';
  const lighting = context?.lighting || 'natural sunlight';
  const mood = context?.mood || 'unknown';
  const perspective = context?.perspective || 'unknown';
  const color_palette = context?.color_palette || ' warm, earthy color palette';
  const focus = context?.focus || 'with a sharp focus on the subject';
  const lens_type = context?.lens_type || 'unknown';
  const segment = segmentText.trim() || 'no scene description';

  return `Cinematic shot of ${name}, a ${age}-year-old ${ethnicity} ${occupation}, dressed in ${clothing}, ${accessories}, ${pose}. Set in ${environment}, in ${location}, during the ${season}, at ${time_of_day}. The weather is ${weather}, and the lighting is ${lighting}. Mood is ${mood}, perspective is ${perspective}, and the color palette is ${color_palette}. Eyes: ${eyes}, hair: ${hair}. Photo focus is ${focus}. Lens type: ${lens_type}. Scene segment: ${segment}`;
}

export function parseTextToCharacter(text: string): CharacterData | null {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const characterData: CharacterData = {};

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Extract name
      if (lowerLine.includes('name:')) {
        characterData.name = line.split(':')[1]?.trim() || 'Unknown';
      }
      // Extract age
      else if (lowerLine.includes('age:')) {
        const ageMatch = line.match(/\d+/);
        if (ageMatch) {
          characterData.age = parseInt(ageMatch[0]);
        }
      }
      // Extract ethnicity
      else if (lowerLine.includes('ethnicity:')) {
        characterData.ethnicity = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract occupation
      else if (lowerLine.includes('occupation:')) {
        characterData.occupation = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract clothing
      else if (lowerLine.includes('clothing:')) {
        characterData.clothing = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract accessories
      else if (lowerLine.includes('accessories:')) {
        characterData.accessories = line.split(':')[1]?.trim() || 'none';
      }
      // Extract pose
      else if (lowerLine.includes('pose:')) {
        characterData.pose = line.split(':')[1]?.trim() || 'standing';
      }
      // Extract eyes
      else if (lowerLine.includes('eyes:')) {
        characterData.eyes = line.split(':')[1]?.trim() || 'normal';
      }
      // Extract hair
      else if (lowerLine.includes('hair:')) {
        characterData.hair = line.split(':')[1]?.trim() || 'normal';
      }
    }

    return characterData;
  } catch (error) {
    console.error('Error parsing character text:', error);
    return null;
  }
}

export function parseTextToContext(text: string): ContextData | null {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const contextData: ContextData = {};

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Extract mood
      if (lowerLine.includes('mood:')) {
        contextData.mood = line.split(':')[1]?.trim() || 'neutral';
      }
      // Extract environment
      else if (lowerLine.includes('environment:')) {
        contextData.environment = line.split(':')[1]?.trim() || 'indoor';
      }
      // Extract time of day
      else if (lowerLine.includes('time:')) {
        contextData.time_of_day = line.split(':')[1]?.trim() || 'day';
      }
      // Extract location
      else if (lowerLine.includes('location:')) {
        contextData.location = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract season
      else if (lowerLine.includes('season:')) {
        contextData.season = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract weather
      else if (lowerLine.includes('weather:')) {
        contextData.weather = line.split(':')[1]?.trim() || 'clear';
      }
      // Extract lighting
      else if (lowerLine.includes('lighting:')) {
        contextData.lighting = line.split(':')[1]?.trim() || 'natural';
      }
      // Extract perspective
      else if (lowerLine.includes('camera_perspective:')) {
        contextData.perspective = line.split(':')[1]?.trim() || 'medium shot';
      }
      // Extract lens type
      else if (lowerLine.includes('lens_type:')) {
        contextData.lens_type = line.split(':')[1]?.trim() || 'unknown';
      }
      // Extract color palette
      else if (lowerLine.includes('color:')) {
        contextData.color_palette = line.split(':')[1]?.trim() || 'natural';
      }
      else if (lowerLine.includes('focus:')) {
        contextData.focus = line.split(':')[1]?.trim() || 'unknown';
      }
    }

    return contextData;
  } catch (error) {
    console.error('Error parsing context text:', error);
    return null;
  }
}

export function validateCharacterData(data: any): data is CharacterData {
  return data && typeof data.name === 'string' && typeof data.age === 'number';
}

export function validateContextData(data: any): data is ContextData {
  const requiredFields = ['mood', 'environment', 'time_of_day', 'emotion', 'location', 'season', 'weather', 'lighting', 'perspective', 'color_palette'];
  return data && requiredFields.every(field => typeof data[field] === 'string');
}

export async function parseFileContent(
  file: File,
  fileType: 'character' | 'context'
): Promise<{ data: CharacterData | ContextData | null; content: string }> {
  if (!file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
    throw new Error("Only .json or .txt files are allowed");
  }

  const content = await file.text();
  let data: any = null;

  if (file.name.endsWith('.json')) {
    // Parse JSON file
    data = JSON.parse(content);
  } else if (file.name.endsWith('.txt')) {
    // Parse text file to JSON
    if (fileType === 'character') {
      data = parseTextToCharacter(content);
    } else if (fileType === 'context') {
      data = parseTextToContext(content);
    }
    
    if (!data) {
      throw new Error(`Failed to parse ${fileType} text file. Please check the format.`);
    }
  }

  // Validate data structure
  if (fileType === 'character') {
    if (!validateCharacterData(data)) {
      throw new Error("Invalid character data: must include 'name' (string) and 'age' (number)");
    }
  } else if (fileType === 'context') {
    if (!validateContextData(data)) {
      // const requiredFields = ['mood', 'environment', 'time_of_day', 'emotion', 'location', 'season', 'weather', 'lighting', 'perspective', 'color_palette'];
      // const missingFields = requiredFields.filter(field => !data[field]);
      // throw new Error(`Invalid context data: missing required fields: ${missingFields.join(', ')}`);
    }
  }

  return {
    data,
    content: JSON.stringify(data, null, 2)
  };
}
