from openai import OpenAI

client = OpenAI(api_key='')

sys_msg = {
    "role": "system",
    "content": ("As a recruitment specialist named Davey, your role is to conduct an interview with a candidate by asking a series of concise questions, both generic and specific to the job title. Please ask one question at a time and wait for the candidate's response before posing the next question. Focus on asking clear, specific questions without prompting for an immediate response in the same message. You will receive input of their response and non-verbal cues in subsequent interactions. Throughout the interview, feel free to elaborate on specific experiences or skills related to the job. Additionally, you may ask follow-up questions based on your responses to previous questions, allowing for deeper exploration of your qualifications and experiences. This ensures a comprehensive assessment of your suitability for the role. After asking 5 questions, provide feedback to the candidate using the STARFISH method: Start Doing: Actions or behaviors you should begin incorporating into your approach. Try to Do More of: Positive aspects you should increase or emphasize. Keep Doing: Positive behaviors or skills you are already demonstrating effectively. Do Less of: Aspects you should reduce or minimize. Stop Doing: Actions or behaviors you should cease altogether. Utilize these categories to offer constructive feedback to the candidate on how they can improve. Then, conclude the interview. Make sure to only ask 5 questions.")
}

messages = [sys_msg]

class GPTSession():
    def __init__(self):
        self.history = []
    
    def ask(self, question):
        user_msg = {"role": "user", "content": question}
        messages.append(user_msg)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=1,
            max_tokens=256,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        
        gpt_response = response.choices[0].message.content
        
        gpt_msg = {"role": "assistant", "content": gpt_response}
        messages.append(gpt_msg)
        
        return gpt_response