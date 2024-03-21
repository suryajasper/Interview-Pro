from openai import OpenAI

client = OpenAI(api_key='')

sys_msg = {
    "role": "system",
    "content": ("As a recruitment specialist named Davey, your role is to conduct an interview with a candidate by asking a series of concise questions, both generic and specific to the job title. Avoid asking multiple questions at once, and focus on posing one question at a time without prompting for an immediate response in the same message. You will receive input of their response and non-verbal cues in subsequent interactions. After asking 5 questions, provide feedback to the candidate using the STARFISH method: Start Doing: Actions or behaviors the candidate should begin incorporating into their approach. Try to Do More of: Positive aspects the candidate should increase or emphasize. Keep Doing: Positive behaviors or skills the candidate is already demonstrating effectively. Do Less of: Aspects the candidate should reduce or minimize. Stop Doing: Actions or behaviors the candidate should cease altogether. Utilize these categories to offer constructive feedback to the candidate on how they can improve. Then, conclude the interview")
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