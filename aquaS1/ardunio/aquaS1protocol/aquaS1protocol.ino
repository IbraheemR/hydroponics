#define TEMP_PIN A0
#define HIGH_LEVEL_PIN A1
#define PUMP_PIN 2

char in;
bool pumping = false;

void setup()
{
  Serial.begin(9600);
  Serial.println("*R");

  pinMode(TEMP_PIN, INPUT);
  pinMode(HIGH_LEVEL_PIN, INPUT_PULLUP);
  pinMode(PUMP_PIN, OUTPUT);
}

void loop()
{
  if (Serial.available() > 0)
  {
    in = Serial.read();
    if (in == '?')
    {
      handleGet();
    }
    else if (in == '!')
    {
      handleSet();
    }
    else if (in == '*')
    {
      handleFlag();
    } else {
      doError(0);
    }
  }

  delay(10);
}

void handleGet()
{
  in = Serial.read();
  if (in == 'T')
  {
    Serial.print("!T");
    Serial.println(getTemp());
  }

  else if (in == 'L')
  {
    Serial.print("!L");
    Serial.println(getLevel());
  }
  else if (in == 'P')
  {
    Serial.print("!P");
    Serial.println(pumping);
  }
  else
  {
    doError(1);
  }
}

#define TEMP_R1 10000
#define TEMP_c1 1.009249522e-03
#define TEMP_c2 2.378405444e-04
#define TEMP_c3 2.019202697e-07
float getTemp()
{
  int V = analogRead(TEMP_PIN);
  float T = TEMP_R1 * (1023.0 / (float)V - 1.0);
  T = log(T);
  T = (1.0 / (TEMP_c1 + TEMP_c2 * T + TEMP_c3 * T * T * T));
  T = T - 273.15;

  return T;
}

bool getLevel()
{
  return analogRead(HIGH_LEVEL_PIN) < 300;
}

void handleSet()
{
  in = Serial.read();
  if (in == 'P')
  {
    in = Serial.read();
    if (in == '0')
    {
      setPump(false);
    }
    else if (in == '1')
    {
      setPump(true);
    }
    else
    {
      doError(2);
    }
  }
  else
  {
    doError(3);
  }
}

void setPump(bool state) {
  pumping = state;
  digitalWrite(PUMP_PIN, state);
}

void handleFlag()
{
  in = Serial.read();
  if (in == 'R')
  {
    Serial.println("*R");
  }
  if (in == 'X') {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
    delay(200);
    digitalWrite(LED_BUILTIN, HIGH);    
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
    delay(200);
  }
  else
  {
    doError(4);
  }
}

void doError(int val)
{
  Serial.print("*E");
  Serial.println(val);
}
