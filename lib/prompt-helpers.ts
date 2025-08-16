import { CharacterData, ContextData, PromptTemplate } from './prompt-types';

export function generatePrompt(character: CharacterData | null, context: ContextData | null, segmentText: string): string {
  const template = `Cinematic shot of {name}, a {age}-year-old {ethnicity} {occupation}, dressed in {clothing}, {accessories}, {pose}.Set in {environment}, in {location}, during the {season}, at {time_of_day}.The weather is {weather}, and the lighting is {lighting}. Mood is {mood}, emotion is {emotion}, perspective is {perspective}, and the color palette is {color_palette}.Eyes: {eyes}, hair: {hair}. Photo focus is {focus}. Scene segment: {segment_text}`;

  let finalPrompt = template;

  // Replace character variables
  if (character) {
    finalPrompt = finalPrompt.replace(/{name}/g, character.name || 'unknown');
    finalPrompt = finalPrompt.replace(/{age}/g, character.age?.toString() || 'unknown');
    finalPrompt = finalPrompt.replace(/{ethnicity}/g, character.ethnicity || 'unknown');
    finalPrompt = finalPrompt.replace(/{occupation}/g, character.occupation || 'unknown');
    finalPrompt = finalPrompt.replace(/{clothing}/g, character.clothing || 'unknown');
    finalPrompt = finalPrompt.replace(/{accessories}/g, character.accessories || 'none');
    finalPrompt = finalPrompt.replace(/{pose}/g, character.pose || 'standing');
    finalPrompt = finalPrompt.replace(/{eyes}/g, character.eyes || 'normal');
    finalPrompt = finalPrompt.replace(/{hair}/g, character.hair || 'normal');
  }

  // Replace context variables
  if (context) {
    finalPrompt = finalPrompt.replace(/{environment}/g, context.environment || 'unknown');
    finalPrompt = finalPrompt.replace(/{location}/g, context.location || 'unknown');
    finalPrompt = finalPrompt.replace(/{season}/g, context.season || 'unknown');
    finalPrompt = finalPrompt.replace(/{time_of_day}/g, context.time_of_day || 'unknown');
    finalPrompt = finalPrompt.replace(/{weather}/g, context.weather || 'unknown');
    finalPrompt = finalPrompt.replace(/{lighting}/g, context.lighting || 'unknown');
    finalPrompt = finalPrompt.replace(/{mood}/g, context.mood || 'unknown');
    finalPrompt = finalPrompt.replace(/{emotion}/g, context.emotion || 'unknown');
    finalPrompt = finalPrompt.replace(/{perspective}/g, context.perspective || 'unknown');
    finalPrompt = finalPrompt.replace(/{color_palette}/g, context.color_palette || 'unknown');
    finalPrompt = finalPrompt.replace(/{focus}/g, context.focus || 'unknown');
  }

  // Replace scene segment
  finalPrompt = finalPrompt.replace(/{segment_text}/g, segmentText.trim() || 'no scene description');

  // Clean up any remaining template variables
  finalPrompt = finalPrompt.replace(/\{[^}]+\}/g, 'unknown');

  return finalPrompt;
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
      // Extract emotion
      else if (lowerLine.includes('emotion:')) {
        contextData.emotion = line.split(':')[1]?.trim() || 'neutral';
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
      else if (lowerLine.includes('perspective:')) {
        contextData.perspective = line.split(':')[1]?.trim() || 'medium shot';
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
