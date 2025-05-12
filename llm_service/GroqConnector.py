import os
import requests
from dotenv import load_dotenv

class GroqConnector:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('GROQ_API_KEY')
        self.base_url = os.getenv('GROQ_BASE_URL')
        
        # Modeloak konfiguratuko ditugu
        self.models = {
            'llama-3.3-70b': 'llama-3.3-70b-versatile',
            'llama3-70b': 'llama3-70b-8192',
            'llama-3.1-8b': 'llama-3.1-8b-instant',
            'gemma': 'gemma2-9b-it'
        }
    
    def _get_headers(self):
        return {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def send_prompt(self, prompt, model='llama3-70b', max_tokens=4096):
        """
        Prompt bat bidali Groq zerbitzura
        
        :param prompt: Bidali nahi den testua
        :param model: Erabili nahi den eredua
        :param max_tokens: Gehienezko erantzun luzera
        :return: Modeloaren erantzuna
        """
        payload = {
            'model': self.models[model],
            'messages': [
                {
                    'role': 'system', 
                    'content': 'Zara CIVilizaTu jokoko IA agente bat'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': max_tokens
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions', 
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        
        except requests.exceptions.RequestException as e:
            print(f"Errorea Groq-era konektatzean: {e}")
            return None