import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import {
  Keyboard,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import * as SQLite from 'expo-sqlite';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from "react-native";

const db = SQLite.openDatabase({ name: 'UserDatabase.db', location:'default' },()=>{}, error=>{console.log(error)});

export default function App() {
  const [task, setTask] = useState([]);
  const [name, setName] = useState("");
  const [newTask, setNewTask] = useState("");

   useEffect(()=>{createTable();},[]);

  const createTable = () => {
    db.transaction((tx) =>{
      tx.executeSql("CREATE TABLE IF NOT EXISTS Tasks (ID INTEGER PRIMARY KEY AUTOINCREMENT, Task TEXT);")
    })
  }

  if(!name){
    getNewName()
  }

  async function getNewName(){
    const options = {
      method: 'GET',
      url: 'https://randomuser.me/api/',
    };
  
    axios.request(options).then(function (response) {
      setName(response.data.results[0].name.first);
    }).catch(function (error) {
      console.error(error);
    });
  }

  async function addTask() {
    const search = task.filter(task => task === newTask);

    if (search.length !== 0) {
      Alert.alert("Item já cadastrado");
      return;
    }

    await db.transaction(async (tx) => {
      await tx.executeSql(
        'INSERT INTO Tasks (task) VALUES (?)',
        [task]
      );
    });

    setTask([...task, newTask]);
    setNewTask("");

    Keyboard.dismiss();
  }

  async function removeTask(item) {
    Alert.alert(
      "Deseja deletar este item?",
      "",
      [
        {
          text: "Cancelar",
          onPress: () => {
            return;
          },
          style: "cancel"
        },
        {
          text: "Deletar",
          onPress: () =>  {
            setTask(task.filter(tasks => tasks !== item));
            db.transaction((tx)=>{
              tx.executeSql(
                "DELETE FROM Tasks WHERE Task="+item,
              );
            });
          } 
        }
      ],
      { cancelable: false }
    );
  }

  useEffect(() => {
    async function carregaDados() {
      db.transaction((tx)=>{
        tx.executeSql(
          "SELECT Task FROM Tasks", [], (tx, results)=>{
            var len = results.rows.length;
            if(len>0){
              const task = results.rows;
            }else{
              const task = [];
            }
          }
        );
      });
    }
    carregaDados();
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={0}
        behavior="padding"
        style={{ flex: 1 }}
        enabled={true}
      >
        <View style={styles.container}>

          <View style={styles.spacerVertical20}>
            <View style={styles.TitleContainer}>
              <Text style={styles.TitleDF}>Olá {name}</Text>
              <TouchableOpacity onPress={() => getNewName()}>
                        <MaterialIcons
                          name="refresh"
                          size={25}
                          color="#505050"
                          style={styles.spacerVertical5}
                        />
                      </TouchableOpacity>
            </View>
            
            
            <View style={styles.spacerVertical5}></View>
            <View
            style={{
              borderBottomColor: '#505050',
              borderBottomWidth: 1,
              opacity: .3,
            }}
          />
          </View>
          <View style={styles.Body}>
            <FlatList
              data={task}
              keyExtractor={item => item.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.FlatList}
              renderItem={({ item }) => (
                <View style={styles.ItemContainer}>
                  <Text style={styles.BodyDF}>{item}</Text>
                  <View style={styles.ItemIconsContainer}>
                      <TouchableOpacity onPress={() => removeTask(item)}>
                        <MaterialIcons
                          name="delete"
                          size={25}
                          color="#505050"
                        />
                      </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          <View style={styles.Form}>
            <TextInput
              style={styles.Input}
              placeholderTextColor="#505050"
              autoCorrect={true}
              value={newTask}
              placeholder="Novo item"
              maxLength={30}
              onChangeText={text => setNewTask(text)}
            />
            <TouchableOpacity style={styles.Button} onPress={() => addTask()}>
              <MaterialIcons name="create" size={20} color="#505050" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
  },
  spacerVertical20: {
    marginTop: 20,
    marginBottom: 20,
  },
  spacerVertical5: {
    marginTop: 5,
    marginBottom: 5,
  },
  spacerLeft10: {
    marginLeft: 10,
  },
  Body: {
    flex: 1
  },
  Form: {
    padding: 0,
    height: 60,
    justifyContent: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    paddingTop: 13,
    borderTopWidth: 2,
    borderColor: "#eee"
  },
  Input: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    paddingVertical: 5,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  Button: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    marginLeft: 10
  },
  FlatList: {
    flex: 1,
    marginTop: 5
  },
  TitleDF: {
    fontSize: 30,
    color: "#505050",
    fontWeight: "bold",
    textAlign: "left",
    
  },
  TitleContainer:{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  BodyDF: {
    fontSize: 14,
    color: "#505050",
    marginTop: 4,
    textAlign: "center"
  },
  ItemContainer: {
    marginBottom: 15,
    padding: 15,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ItemIconsContainer: {
    borderRadius: 4,
    display: "flex",
    flexDirection: "row",
  },
  ItemIconsContainer: {
    borderRadius: 4,
    display: "flex",
    flexDirection: "row",
  }
});
