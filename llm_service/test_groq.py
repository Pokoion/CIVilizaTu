from GroqConnector import GroqConnector

def main():
    connector = GroqConnector()
    
    # Test prompt
    prompt = """
    CIVilizaTu jokoan, zure zibilizazioa Euskaldunak dira. 
    Uneko egoera azaldu eta zure estrategia zehaztu. Tell me
    how many tokens left you have and the name of your model.
    """
    
    response = connector.send_prompt(prompt)
    print(response)

if __name__ == '__main__':
    main()